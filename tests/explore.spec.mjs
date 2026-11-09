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
