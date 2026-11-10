// node docs/showcase/render.mjs [--stills]
// Requires Chrome, FFmpeg (libx264) and img2webp. No npm dependencies.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { launchBrowser } from '../../skills/uiux-orchestrator/scripts/lib/cdp.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(here, '../assets');
const stills = process.argv.includes('--stills');
const frames = await fs.mkdtemp(path.join(os.tmpdir(), 'veltora-frames-'));
let browser;
try {
  browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails.text));
  const viewport = async (width, height) => page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const seek = async t => page.evaluate(`window.veltora.renderAt(${t})`);
  const shot = async (file, format = 'png') => {
    const { data } = await page.send('Page.captureScreenshot', { format, ...(format === 'jpeg' ? { quality: 95 } : {}), captureBeyondViewport: false });
    await fs.writeFile(file, Buffer.from(data, 'base64'));
    return data;
  };
  await viewport(1440, 900);
  await page.goto(`${pathToFileURL(path.join(here, 'index.html')).href}?capture`, 500);
  await page.evaluate('window.veltora.ready');
  assert.equal(await page.evaluate("document.querySelector('#perfume').naturalWidth > 0"), true, 'Product image must load');
  await seek(0);
  const first = await shot(path.join(assets, 'veltora-overview.jpg'), 'jpeg');
  await seek(10);
  const loop = await shot(path.join(frames, 'loop.jpg'), 'jpeg');
  assert.equal(loop, first, 'Loop must close pixel-for-pixel');
  await seek(5.4);
  await shot(path.join(assets, 'veltora-detail.jpg'), 'jpeg');
  assert.equal(await page.evaluate(`document.querySelector('.craft').getAttribute('aria-hidden')`), 'false');
  await page.evaluate(`document.querySelector('nav [data-chapter="0"]').click()`);
  assert.equal(await page.evaluate(`document.querySelector('.hero').getAttribute('aria-hidden')`), 'false');
  for (const width of [320, 390, 600, 768, 1440]) {
    await viewport(width, width<=760?1060:900);
    await seek(0);
    assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false, `Overflow at ${width}px`);
    if (width === 390) await shot(path.join(assets, 'veltora-mobile.jpg'), 'jpeg');
    if ([320,390,600,768].includes(width)) {
      await shot(path.join(os.tmpdir(), `veltora-check-${width}-hero.png`));
      await seek(5.4);
      await shot(path.join(os.tmpdir(), `veltora-check-${width}-detail.png`));
    }
  }
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await page.goto(pathToFileURL(path.join(here, 'index.html')).href, 200);
  assert.equal(await page.evaluate('window.veltora.paused'), true, 'Reduced motion must start paused');
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await page.goto(`${pathToFileURL(path.join(here, 'index.html')).href}?capture`, 200);
  assert.deepEqual(errors, [], 'Browser exceptions');
  console.log('Verified product image, exact loop closure, chapter controls, reduced motion and five viewport widths.');
  if (!stills) {
    // Capture at the final delivery resolution. No wall-clock delays or dropped frames.
    await viewport(1440, 900);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 5 / 6, mobile: false });
    const fps = 30, total = fps * 10;
    for (let i = 0; i < total; i++) {
      await seek(i / fps);
      await shot(path.join(frames, `frame-${String(i).padStart(4, '0')}.png`));
      if (i % 60 === 0) console.log(`Captured ${i}/${total}`);
    }
    const input = path.join(frames, 'frame-%04d.png');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', input, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(assets, 'veltora-demo.mp4')]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(assets, 'veltora-demo.mp4'), '-vf', 'fps=25,scale=800:500:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', path.join(assets, 'veltora-demo.gif')]);
    const webpFrames = path.join(frames, 'webp');
    await fs.mkdir(webpFrames);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', input, '-vf', 'scale=960:-1:flags=lanczos', path.join(webpFrames, 'frame-%04d.png')]);
    const webpArgs = ['-loop', '0', '-lossy', '-q', '74', '-m', '4'];
    for (let i = 0; i < total; i++) webpArgs.push('-d', String(i % 3 === 2 ? 34 : 33), path.join(webpFrames, `frame-${String(i + 1).padStart(4, '0')}.png`));
    webpArgs.push('-o', path.join(assets, 'veltora-demo.webp'));
    execFileSync('img2webp', webpArgs, { stdio: 'pipe' });
    console.log('Exported 30fps 1200×750 MP4 and 960×600 WebP; 25fps 800×500 GIF.');
  }
} finally {
  if (browser) await browser.close();
  await fs.rm(frames, { recursive: true, force: true });
}
