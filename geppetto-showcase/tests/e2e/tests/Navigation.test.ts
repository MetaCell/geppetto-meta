//IMPORTS:
// import "expect-puppeteer";
import * as puppeteer from "puppeteer";
import 'expect-puppeteer';

const path = require("path");
var scriptName = path.basename(__filename, ".js");
import { Browser } from 'puppeteer';



//PAGE INFO:
const baseURL = process.env.url || "https://www.geppetto.metacell.us/";
const TIMEOUT = 60000;

function range(size: number, startAt: number = 0): number[] {
  return Array.from({ length: size }, (_, i) => i + startAt);
}


//TESTS:

jest.setTimeout(300000);

let n_browser: Browser;
let n_page;

describe("Navigation/Layout tests", () => {
  beforeAll(async () => {
    n_browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        `--window-size=1600,1000`,
        "--ignore-certificate-errors",
      ],
      headless: true,
      devtools: false,
      defaultViewport: {
        width: 1600,
        height: 1000,
      },
    });

    n_page = await n_browser.newPage();
    await n_page.goto(baseURL, { timeout: TIMEOUT });

    await n_page.waitForSelector('.MuiDrawer-root.MuiDrawer-docked', { hidden: false, timeout: TIMEOUT });

    n_page.on("response", (response) => {
      const client_server_errors = range(90, 400);
      for (let i = 0; i < client_server_errors.length; i++) {
        expect(response.status()).not.toBe(client_server_errors[i]);
      }
    });
  });

  afterAll(async () => {
    await n_browser.close();
  });


  describe("Flex Layout", () => {
    it("Flex Layout check", async () => {
      console.log("Checking Flex Layout ...")
      await n_page.goto(baseURL, { timeout: TIMEOUT });
      await n_page.waitForSelector('a[href="/navigation/flexlayout"]', { hidden: false, timeout: TIMEOUT })
      await n_page.click('a[href="/navigation/flexlayout"]')
      // await n_page.waitForFunction(
      //   () => {
      //     let el = document.querySelector(".MuiCircularProgress-root");
      //     return el == null || el.clientHeight === 0;
      //   },
      //   { timeout: TIMEOUT * 2 }
      // );
      await n_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT * 2});
      await n_page.waitForSelector('div.flexlayout__layout', { hidden: false, timeout: TIMEOUT });
      await n_page.waitForTimeout(300)
      console.log("Flex Layout check done");
    })
  })

  describe.skip("List Viewer", () => {
    it("List Viewer check", async () => {
      console.log("Checking List Viewer ...")
      await n_page.goto(baseURL, { timeout: TIMEOUT });
      await n_page.waitForSelector('a[href="/navigation/listviewer"]', { hidden: false, timeout: TIMEOUT })
      await n_page.click('a[href="/navigation/listviewer"]')
      // await n_page.waitForFunction(
      //   () => {
      //     let el = document.querySelector(".MuiCircularProgress-root");
      //     return el == null || el.clientHeight === 0;
      //   },
      //   { timeout: TIMEOUT * 2 }
      // );
      await n_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT * 2});
      await n_page.waitForTimeout(300)
      console.log("List Viewer check done");
    })

  })

  describe("Loader", () => {
    it("Loader check", async () => {
      console.log("Checking Loader ...")
      await n_page.goto(baseURL, { timeout: TIMEOUT });
      await n_page.waitForSelector('a[href="/navigation/loader"]', { hidden: false, timeout: TIMEOUT })
      await n_page.click('a[href="/navigation/loader"]')
      // await n_page.waitForFunction(
      //   () => {
      //     let el = document.querySelector(".MuiCircularProgress-root");
      //     return el == null || el.clientHeight === 0;
      //   },
      //   { timeout: TIMEOUT * 2 }
      // );
      await n_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT * 2 });
      await n_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await n_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await n_page.waitForSelector('.MuiCircularProgress-root', { hidden: false, timeout: TIMEOUT });
      await n_page.waitForTimeout(300)
      console.log("Loader check done");
    })

  })

  describe("Menu", () => {
    it("Menu check", async () => {
      console.log("Checking Menu ...")
      await n_page.goto(baseURL, { timeout: TIMEOUT });
      await n_page.waitForSelector('a[href="/navigation/menu"]', { hidden: false, timeout: TIMEOUT })
      await n_page.click('a[href="/navigation/menu"]')
      // await n_page.waitForFunction(
      //   () => {
      //     let el = document.querySelector(".MuiCircularProgress-root");
      //     return el == null || el.clientHeight === 0;
      //   },
      //   { timeout: TIMEOUT * 2 }
      // );
      await n_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT * 2});
      await n_page.waitForSelector('#Tools', { hidden: false, timeout: TIMEOUT });
      await n_page.waitForTimeout(300)
      console.log("Menu check done");
    })

  })

  describe.skip("Search", () => {
    it("Search check", async () => {

    })
  })

  describe.skip("Tree Viewer", () => {
    it("Tree Viewer check", async () => {
      console.log("Checking Tree Viewer ...")
      await n_page.goto(baseURL, { timeout: TIMEOUT });
      await n_page.waitForSelector('a[href="/navigation/treeviewer"]', { hidden: false, timeout: TIMEOUT })
      await n_page.click('a[href="/navigation/treeviewer"]')
      // await n_page.waitForFunction(
      //   () => {
      //     let el = document.querySelector(".MuiCircularProgress-root");
      //     return el == null || el.clientHeight === 0;
      //   },
      //   { timeout: TIMEOUT * 2 }
      // );
      await n_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT * 2});
      // await n_page.waitForSelector('iframe[title="MetaCell Showcase"]', { hidden: false, timeout: TIMEOUT });
      await n_page.waitForTimeout(300)
      console.log("Tree Viewer check done");
    })
  })


});
