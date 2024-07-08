//IMPORTS:
// import "expect-puppeteer";
import * as puppeteer from "puppeteer";
import 'expect-puppeteer';
import { Browser } from 'puppeteer';


const path = require("path");
var scriptName = path.basename(__filename, ".js");


//PAGE INFO:
const baseURL = process.env.url || "https://www.geppetto.metacell.us/";
const TIMEOUT = 60000;

function range(size: number, startAt: number = 0): number[] {
  return Array.from({ length: size }, (_, i) => i + startAt);
}


//TESTS:

jest.setTimeout(300000);


let pi_browser: Browser;
let pi_page;

describe("Programming Interfaces tests", () => {
  beforeAll(async () => {
    pi_browser = await puppeteer.launch({
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

    pi_page = await pi_browser.newPage();
    await pi_page.goto(baseURL, { timeout: TIMEOUT });

    await pi_page.waitForSelector('.MuiDrawer-root.MuiDrawer-docked', { hidden: false, timeout: TIMEOUT });

    pi_page.on("response", (response) => {
      const client_server_errors = range(90, 400);
      for (let i = 0; i < client_server_errors.length; i++) {
        expect(response.status()).not.toBe(client_server_errors[i]);
      }
    });
  });

  afterAll(async () => {
    await pi_browser.close();
  });


  describe("Python Console", () => {
    it("Python Console check", async () => {
      console.log("Checking Python Console ...")
      await pi_page.goto(baseURL, { timeout: TIMEOUT });
      await pi_page.waitForSelector('a[href="/programmatic/pythonconsole"]', { hidden: false, timeout: TIMEOUT })
      await pi_page.click('a[href="/programmatic/pythonconsole"]')
      // await pi_page.waitForFunction(
      //   () => {
      //     let el = document.querySelector(".MuiCircularProgress-root");
      //     return el == null || el.clientHeight === 0;
      //   },
      //   { timeout: TIMEOUT * 2 }
      // );
      await pi_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT * 2});
      await pi_page.waitForSelector('div[class*="Showcase-centerComponent"]', { hidden: false, timeout: TIMEOUT});
      await pi_page.waitForTimeout(300)
      console.log("Python COnsole check done");
    })
  })


});
