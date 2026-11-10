import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const pageUrl='file://'+path.resolve('index.html');
for (const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
 test.describe(device.name,()=>{
  test.use({viewport:{width:device.width,height:device.height}});
  test('世界同一刻 → 地区 → 事件 → 资料',async({page})=>{
   await page.goto(pageUrl);
   await expect(page.locator('#momentGrid .moment-region')).toHaveCount(8);
   const select=page.locator('#momentPeriod');
   await select.selectOption({index:2});
   await expect(page.locator('#momentContext')).not.toBeEmpty();
   await expect(page.locator('#momentGrid .moment-depth').first()).toBeVisible();
   await page.locator('#momentGrid .moment-event').first().click();
   await expect(page.locator('#overlay')).toHaveClass(/open/);
   await expect(page.locator('#modalTitle')).not.toBeEmpty();
   await expect(page.locator('#modalBody')).toContainText('发生了什么');
   await page.keyboard.press('Escape');
   await expect(page.locator('#overlay')).not.toHaveClass(/open/);
   await page.screenshot({path:'test-results/'+device.name+'-moment.png',fullPage:true});
  });
  test('深读路线 → 证据比较 → 原文来源 → 笔记',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#journeyGrid [data-journey]').first().click();
   await expect(page.locator('#overlay')).toHaveClass(/open/);
   await expect(page.locator('.deep-feature')).toBeVisible();
   await page.locator('#journeyNote').fill('回归测试：证据和结论应区分');
   await page.locator('#journeySaveNote').click();
   await page.locator('[data-journey-step="3"]').first().click();
   await expect(page.locator('.journey-comparison')).toBeVisible();
   await page.locator('.journey-evidence-card [data-journey-step]').first().click();
   await expect(page.locator('.deep-sources')).toHaveCount(1);
   await page.locator('.deep-sources summary').click();
   await expect(page.locator('.deep-sources a').first()).toHaveAttribute('href',/^https:\/\//);
   await page.screenshot({path:'test-results/'+device.name+'-evidence.png'});
  });

  test('八区聚焦 → 恢复全景 → 保持同期阶段',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#momentPeriod').selectOption({index:3});
   const period=await page.locator('#momentPeriod').inputValue();
   await page.locator('#momentFilter button').nth(2).click();
   await expect(page.locator('#momentFilter button').nth(2)).toHaveAttribute('aria-pressed','true');
   await expect(page.locator('#momentGrid .moment-region')).toHaveCount(8);
   await page.locator('#momentClear').click();
   await expect(page.locator('#momentFilter button[aria-pressed="true"]')).toHaveCount(0);
   await expect(page.locator('#momentPeriod')).toHaveValue(period);
   await page.screenshot({path:'test-results/'+device.name+'-regions.png',fullPage:true});
  });
  test('专题来源 → 笔记保存 → 重新进入仍存在',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#journeyGrid [data-journey]').first().click();
   await expect(page.locator('.deep-feature')).toBeVisible();
   const text='回归测试 '+device.name+'：阅读来源后保留笔记';
   await page.locator('#journeyNote').fill(text);
   await page.locator('#journeySaveNote').click();
   await page.locator('.deep-sources summary').click();
   await expect(page.locator('.deep-sources a').first()).toHaveAttribute('href',/^https:\/\//);
   await page.keyboard.press('Escape');
   await page.locator('#journeyGrid [data-journey]').first().click();
   await expect(page.locator('#journeyNote')).toHaveValue(text);
   await expect(page.locator('.deep-feature')).toBeVisible();
  });
  test('八区展开全部事件 → 详情 → 返回保留展开状态',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#momentPeriod').selectOption({index:0});
   const expand=page.locator('#momentGrid .moment-expand').first();
   await expect(expand).toBeVisible();
   const card=expand.locator('xpath=..');
   const before=await card.locator('.moment-event').count();
   await expand.click();
   await expect(card.locator('.moment-expand')).toHaveAttribute('aria-expanded','true');
   const after=await card.locator('.moment-event').count();
   expect(after).toBeGreaterThan(before);
   await card.locator('.moment-event').last().click();
   await expect(page.locator('#overlay')).toHaveClass(/open/);
   await page.keyboard.press('Escape');
   await expect(card.locator('.moment-expand')).toHaveAttribute('aria-expanded','true');
   await page.screenshot({path:'test-results/'+device.name+'-expanded-regions.png',fullPage:true});
  });
  test('同期比较排序与筛选重置保持可操作',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#search').fill('印度河');
   await page.locator('.event-card').first().click();
   const comparison=page.locator('#compareSort').locator('xpath=ancestor::section[1]');
   const before=await comparison.locator('[data-related-id]').count();
   expect(before).toBeGreaterThan(0);
   await page.locator('#compareSort').click();
   await expect(page.locator('#compareSort')).toHaveAttribute('aria-pressed','true');
   await expect(comparison.locator('[data-related-id]')).toHaveCount(before);
   await page.locator('#compareRegion').selectOption({index:1});
   await page.locator('#compareReset').click();
   await expect(page.locator('#compareRegion')).toHaveValue('all');
   await expect(page.locator('#compareSearch')).toBeFocused();
  });
  test('未保存草稿 → 同期事件切换 → 返回原事件仍存在',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#search').fill('印度河');
   await page.locator('.event-card').first().click();
   const draft='自动保存草稿 '+device.name+' · '+Date.now();
   await page.locator('#noteArea').fill(draft);
   await page.locator('[data-related-id]').first().click();
   await expect(page.locator('#modalBody')).toHaveAttribute('data-note-owner',/^e[0-9]+$/);
   await page.keyboard.press('Escape');
   await page.locator('#search').fill('印度河');
   await page.locator('.event-card').first().click();
   await expect(page.locator('#noteArea')).toHaveValue(draft);
   await page.locator('#noteArea').fill(draft+' · 关闭时保存');
   await page.keyboard.press('Escape');
   // Sticky timeline headers can overlap a scrolled card on narrow screens;
   // keyboard activation is a supported real user path and avoids pointer interception.
   await page.locator('.event-card').first().focus();
   await page.keyboard.press('Enter');
   await expect(page.locator('#noteArea')).toHaveValue(draft+' · 关闭时保存');
  });

  test('真实馆藏 → 证据边界 → 原始记录 → 离线回退 → 返回事件',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#search').fill('埃及');
   const card=page.locator('.event-card').filter({hasText:'埃及'}).first();
   await card.focus();
   await page.keyboard.press('Enter');
   await expect(page.locator('#overlay')).toHaveClass(/open/);
   const artifact=page.locator('[data-artifact-view="e13"]');
   if(await artifact.count()===0){
    await page.keyboard.press('Escape');
    await page.locator('#search').fill('');
    await page.locator('.event-card').filter({has:page.locator('.artifact-thumb')}).first().click();
   }
   await page.locator('[data-artifact-view="e13"]').click();
   await expect(page.locator('.artifact-viewer')).toBeVisible();
   await expect(page.locator('.artifact-viewer-copy')).toContainText('局限');
   await expect(page.locator('.artifact-viewer-copy a[href*="metmuseum.org"]')).toHaveAttribute('rel',/noopener/);
   await page.locator('.artifact-viewer-image img').evaluate(img=>img.dispatchEvent(new Event('error')));
   await expect(page.locator('.artifact-viewer-fallback')).toBeVisible();
   await expect(page.locator('.artifact-viewer-fallback')).toContainText('并非历史实物照片');
   await page.locator('#artifactBack').click();
   await expect(page.locator('#modalBody')).toContainText('埃及');
   await page.screenshot({path:'test-results/'+device.name+'-artifact-fallback.png'});
  });

  test('搜索 → 事件详情 → 键盘关闭并恢复焦点',async({page})=>{
   await page.goto(pageUrl);
   await page.locator('#search').fill('苏美尔');
   await expect(page.locator('.event-card').first()).toBeVisible();
   const event=page.locator('.event-card').first();
   await event.focus();
   await page.keyboard.press('Enter');
   await expect(page.locator('#overlay')).toHaveClass(/open/);
   await expect(page.locator('.deep-feature')).toBeVisible();
   await page.keyboard.press('Escape');
   await expect(page.locator('#overlay')).not.toHaveClass(/open/);
   await expect(event).toBeFocused();
  });
 });
}
