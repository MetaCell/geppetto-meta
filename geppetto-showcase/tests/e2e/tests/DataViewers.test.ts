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

let dv_browser: Browser;
let dv_page;

describe("Data Viewer tests", () => {
  beforeAll(async () => {
    dv_browser = await puppeteer.launch({
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

    dv_page = await dv_browser.newPage();
    await dv_page.goto(baseURL);

    await dv_page.waitForSelector('.MuiDrawer-root.MuiDrawer-docked');

    dv_page.on("response", (response) => {
      const client_server_errors = range(90, 400);
      for (let i = 0; i < client_server_errors.length; i++) {
        expect(response.status()).not.toBe(client_server_errors[i]);
      }
    });
  });

  afterAll(async () => {
    await dv_browser.close();
  });

  describe("3D Canvas", () => {

    it("Multiple Instances check", async () => {
      console.log("Checking Multiple Instances ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('a[href="/dataviewers/canvas"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/canvas"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="MultipleInstancesExample-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Multiple Instances check done");
    });

    it("3D Canvas Auditory Cortex 2 check", async () => {
      console.log("Checking Auditory Cortex 2 ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-1', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-1');
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
       await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="AuditoryCortexExample2-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Auditory Cortex 2 check done");
    })

    it("3D Canvas VFB check", async () => {
      console.log("Checking 3D canvas VFB ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-2', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-2');
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT}); 
      await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="VFBExample-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("3D canvas VFB check done");
    })

    it("3D Canvas CA1 Pyramidal Cell check", async () => { 
      console.log("Checking 3D canvas CA1 Pyramidal Cell ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-3', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-3');
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT}); await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="CA1Example-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("3D canvas CA1 Pyramidal Cell check done");
    })

    it("3D Canvas Auditory Cortex check", async () => { 
      console.log("Checking 3D canvas Auditory Cortex ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-4', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-4');
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT}); 
      await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="AuditoryCortexExample-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("3D canvas Auditory Cortex check done");
    })

    it("Simple Instances check", async () => { 
      console.log("Checking Simple Instances ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-5', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-5');
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT}); 
      await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="SimpleInstancesExample-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Simple Instances check done");
    })

    it("Custom Controls check", async () => { 
      console.log("Checking Custom Controls ...");
      await dv_page.goto(baseURL + "dataviewers/canvas");
      await dv_page.waitForSelector('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-6', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiTabs-scroller.MuiTabs-scrollable #simple-tab-6');
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT}); 
      await dv_page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary', { hidden: false, timeout: TIMEOUT});
      await dv_page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary');
      await dv_page.waitForSelector('[class*="CustomControlsExample-container"] [class*="Canvas-container"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Custom Controls check done");
    })


  })

  describe("Big Image Viewer", () => {
    it("Big Image Viewer check", async () => {
      console.log("Checking Big Image Viewer ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/bigimgviewer"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/bigimgviewer"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('[class*="BigImageViewer-bigImageViewerContainer"] ', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Big Image Viewer check done");
    })
   })

  describe("Connectivity Viewer", () => { 
    it("Connectivity Viewer check", async () => {
      console.log("Checking Connectivity Viewer ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/connectivity"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/connectivity"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('[class*="ConnectivityShowcaseForce-connectivity"] [class*="ConnectivityComponent-container"] ', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Connectivity Viewer check done");
    })

  })

  describe("Dicom Viewer", () => { 
    it("Dicom Viewer check", async () => {
      console.log("Checking Dicom Viewer ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/dicomviewer"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/dicomviewer"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('#DicomViewerContainer_component', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Dicom Viewer check done");
    })

  })

  describe("Graph Visualizer", () => {
    it("Graph Visualizer check", async () => {
      console.log("Checking Graph Visualizer ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/graphvisualizer"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/graphvisualizer"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('.graph-info-msg', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Graph Visualizer check done");
    })

   })

  describe("HTML Viewer", () => {
    it("HTML Viewer check", async () => {
      console.log("Checking HTML Viewer ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/htmlviewer"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/htmlviewer"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('.htmlViewer', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("HTML Viewer check done");
    })
   })

  describe("Movie Player", () => {
    it("Movie Player check", async () => {
      console.log("Checking Movie Player ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/movieplayer"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/movieplayer"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('iframe[title="MetaCell Showcase"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Movie Player check done");
    })
   })

  describe("Plot", () => {
    it("Plot check", async () => {
      console.log("Checking Plot ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/plot"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/plot"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('div[id="nwbfile.acquisition.test_sine_1"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("Plot check done");
    })
   })

  describe.skip("Stack Viewer", () => {
    it("Stack Viewer check", async () => {})
   })

  describe("VR Canvas", () => { 
    it("VR Canvas check", async () => {
      console.log("Checking VR Canvas ...")
      await dv_page.goto(baseURL);
      await dv_page.waitForSelector('a[href="/dataviewers/vrcanvas"]', { hidden: false, timeout: TIMEOUT})
      await dv_page.click('a[href="/dataviewers/vrcanvas"]')
      await dv_page.waitForFunction(
        () => {
          let el = document.querySelector(".MuiCircularProgress-root");
          return el == null || el.clientHeight === 0;
        },
        { timeout: TIMEOUT }
      );
      await dv_page.waitForSelector('h2[class*="Showcase-secondaryTitle"]', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForSelector('#nwbfile.acquisition.test_sine_1', { hidden: false, timeout: TIMEOUT});
      await dv_page.waitForTimeout(300)
      console.log("VR Canvas check done");
    })
  })

});
