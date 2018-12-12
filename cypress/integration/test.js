// Cypress end-to-end tests

// Debugging tips:
// - cy.pause() can be placed before and after the assertion.
// - cy.debug() can be useful... cy.get('.ls-btn').click({ force: true }).debug()
// - Also, you can click on Before/After state in Cypress UI.
// - If you want to use a console in Cypress UI dev tools, first click on Inspect Element to get the correct `window` scope.


// TODO:
// - add tests for rightedge and leftedge, for tooltips
// - test destroyAll with popups with fadeOut animation and scrolllock
// - add tests with mixed options
// - try to improve some tests if possible: test from user perspective instead of testing CSS properties
// create tests for accessibility and wai-aria
// - add tests for default option to all non-boolean options?
// - try to make the same tests in Jest+Puppeteer to see if there will be less issues (although Puppeteer has no UI for debugging)


//-----------------------------------------------------------------------------
// Prepare random options

const randomOptions = {};
const allOptions = {
  color: ['blue', 'red'],
  opacity: [0, 0.5, 1],
  background: [true, false]
}

// Get random value from array
const rand = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Randomize options
Object.keys(allOptions).forEach(function(key) {
  const randomValue = rand(allOptions[key]);
  randomOptions[key] = randomValue; // extend randomOptions object
});


//-----------------------------------------------------------------------------
// Tests

describe("jQuery Popup Overlay", () => {
  context("Options", () => {
    before(() => {
      cy.visit("/cypress/index.html");

      cy.window().then(win => {
        // Extend plugin's defaults with randomOptions
        // UNCOMMENT THIS LINE FOR TESTS WITH RANDOM PLUGIN OPTIONS:
        // Object.assign(win.$.fn.popup.defaults, randomOptions);

        // Log plugin defaults to console (for debugging)
        cy.log('**Defaults:**', JSON.stringify(win.$.fn.popup.defaults));
        win.console.log('**Defaults:**', JSON.stringify(win.$.fn.popup.defaults));

        // jquery ':focus' selector fails when window is not in focus, replace it with our own version.
        // Although, this still doesn't solve an issue when testing :focus styles and such tests will fail.
        // If that happens, re-run the tests with window in focus, or without Cypress UI (i.e. headless).
        // https://github.com/cypress-io/cypress/issues/2176
        win.jQuery.find.selectors.filters.focus = function(elem) {
          const doc = elem.ownerDocument;
          return elem === doc.activeElement && !!(elem.type || elem.href);
        };
      });
    });

    beforeEach(() => {
      cy.window().then(win => {
        // Destroy all popups
        win.$.fn.popup.destroyall();
        // Add markup for temporary (dynamic) test popup
        win
          .$(
            `<div id="dynamic">This is a test popup. <input id="dynamic-dummy-input" /></div>`
          )
          .appendTo("body");
      });

      // A bug in Cypress requires focus to be cleared with .blur(), else next .typeEsc() will fail.
      cy
        .get("#dummy-input")
        .focus()
        .blur();
    });

    it("autoopen true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ autoopen: true });
      });
      cy.get("#dynamic").should("be.visible");
    });

    it("autoopen false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ autoopen: false });
      });
      cy.get("#dynamic").should("not.be.visible");
      cy.get("#dynamic_wrapper").should("exist");
    });

    it("absolute true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ absolute: true, autoopen: true });
      });

      cy.log("IMPORTANT: This test might fail in UI, just re-run the tests.");
      cy.wait(10); // If we don't wait, rect.bottom will be 0 (another Cypress bug probably)
      cy.scrollTo(0, 4000);

      // Manually test for whether elem is out of viewport - https://github.com/cypress-io/cypress/issues/877
      cy.get("#dynamic").then($el => {
        const rect = $el[0].getBoundingClientRect();
        // expect( rect.bottom ).to.be.lessThan( 0 );
        expect(rect.bottom).to.be.lessThan(0);
      });
    });

    it("absolute false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ absolute: false, autoopen: true });
      });

      cy.log("IMPORTANT: This test might fail in UI, just re-run the tests.");
      cy.wait(10); // If we don't wait, rect.bottom will be 0 (another Cypress bug probably)
      cy.scrollTo(0, 4000);

      // Manually test for whether elem is out of viewport - https://github.com/cypress-io/cypress/issues/877
      cy.get("#dynamic").then($el => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.bottom).to.be.greaterThan(0);
      });
    });

    it("type tooltip", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ type: "tooltip", autoopen: true });
      });
      cy.get("#dynamic_wrapper").should("have.css", "position", "absolute");
      cy.get("#dynamic_wrapper").should("have.css", "overflow", "visible");
      cy.get("#dynamic_background").should("not.exist");
      cy.get("body").should("have.css", "overflow", "visible");
    });

    it("type overlay", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ type: "overlay", autoopen: true });
      });
      cy.get("#dynamic_background").should("exist");
      cy.get("#dynamic_wrapper").should("have.css", "overflow", "auto");
      cy.get("#dynamic_wrapper").should("have.css", "text-align", "center");
    });

    it("closebutton", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ closebutton: true, autoopen: true });
      });
      cy.get(".dynamic_close").should("exist"); // button should exist
      cy.get(".dynamic_close").click(); // button should be clickable
    });

    it("scrolllock true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ scrolllock: true, autoopen: true });
      });
      cy.get("body").should("have.css", "overflow", "hidden");
    });

    it("scrolllock false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ scrolllock: false, autoopen: true });
      });
      cy.get("body").should("have.css", "overflow", "visible");
    });

    it("background true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ background: true, autoopen: true });
      });
      cy.get("#dynamic_background").should("exist");
    });

    it("background false", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ background: false, blur: false, autoopen: true });
      });
      cy.get("#dynamic_background").should("not.exist");
      cy
        .get("#dummy-input")
        .click()
        .focus();
      cy.get("#dynamic_background").should("not.exist");
    });

    it("color", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ color: "rgb(255, 0, 0)", autoopen: true });
      });
      cy
        .get("#dynamic_background")
        .should("have.css", "background-color", "rgb(255, 0, 0)");
    });

    it("opacity", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ opacity: 0.1, autoopen: true });
      });
      cy.get("#dynamic_background").should("have.css", "opacity", "0.1");
    });

    it("horizontal", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ horizontal: "left", autoopen: true });
      });
      cy.get("#dynamic_wrapper").should("have.css", "text-align", "left");
    });

    it("vertical", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ vertical: "bottom", autoopen: true });
      });
      cy.get("#dynamic").should("have.css", "vertical-align", "bottom");
    });

    it("offsettop", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({
            offsettop: 100,
            vertical: "bottom",
            type: "tooltip",
            autoopen: true
          });
      });
      cy.get("#dynamic_wrapper").should("have.css", "top", "100px");
    });

    it("offsetleft", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({
            offsetleft: 100,
            horizontal: "leftedge",
            type: "tooltip",
            autoopen: true
          });
      });
      cy.get("#dynamic_wrapper").should("have.css", "left", "100px");
    });

    it("escape true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ escape: true, autoopen: true });
      });
      cy.typeEsc();
      cy.get("#dynamic").should("be.hidden");
    });

    it("escape false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ escape: false, autoopen: true });
      });
      cy.typeEsc();
      cy.get("#dynamic").should("be.visible");
    });

    it("blur true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ blur: true, autoopen: true });
      });
      // Clicking on the popup content should not hide it (this click is also required for a bug in Cypress with pointer-events:none)
      cy.get("#dynamic").click(1, 1);
      cy.get("#dynamic").should("be.visible");
      // Clicking outside of the popup
      cy.get("#dynamic_wrapper").click(1, 1, { force: true }); // Cypress doesn't respect pointer-events:none; so we have to force the click
      cy.get("#dynamic").should("be.hidden");
    });

    it("blur false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ blur: false, autoopen: true });
      });
      // Clicking on the popup content should not hide it (this click is also required for a bug in Cypress with pointer-events:none)
      cy.get("#dynamic").click(1, 1);
      cy.get("#dynamic").should("be.visible");
      // Clicking outside of the popup
      cy.get("#dynamic_background").click(1, 1, { force: true }); // Cypress doesn't respect pointer-events:none; so we have to force the click
      cy.get("#dynamic").should("be.visible");
    });

    it("blurignore", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ blurignore: 'h1', blur: true, autoopen: true });
      });
      // Clicking on the popup content should not hide it (this click is also required for a bug in Cypress with pointer-events:none)
      cy.get("#dynamic").click(1, 1);
      cy.get("#dynamic").should("be.visible");
      // Clicking on h1 to test `blurignore`
      cy.get("h1").click({ force: true });
      cy.get("#dynamic").should("be.visible");
      // Clicking outside of the popup
      cy.get("#dynamic_wrapper").click(1, 1, { force: true }); // Cypress doesn't respect pointer-events:none; so we have to force the click
      cy.get("#dynamic").should("be.hidden");
    });

    it("setzindex true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ setzindex: true, autoopen: true });
      });
      cy.get("#dynamic_background").should("have.css", "z-index", "100000");
      cy.get("#dynamic_wrapper").should("have.css", "z-index", "100001");
    });

    it("setzindex false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ setzindex: false, autoopen: true });
      });
      cy.get("#dynamic_background").should("have.css", "z-index", "auto");
      cy.get("#dynamic_wrapper").should("have.css", "z-index", "auto");
    });

    it("autozindex true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ autozindex: true, autoopen: true });
      });
      cy.get("#dynamic_background").should("have.css", "z-index", "56"); // z-index:55 is set in HTML file
      cy.get("#dynamic_wrapper").should("have.css", "z-index", "57");
    });

    it("autozindex false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ autozindex: false, autoopen: true });
      });
      cy.get("#dynamic_background").should("have.css", "z-index", "100000");
      cy.get("#dynamic_wrapper").should("have.css", "z-index", "100001");
    });

    it("keepfocus true", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ keepfocus: true, closebutton: true, autoopen: true });
      });
      cy.focused().should("have.id", "dynamic"); // check if popup gets focus
      cy.get(".dynamic_close").focus();
      cy.typeTab();
      cy.focused().should("have.id", "dynamic-dummy-input"); // check if focus stays in popup
    });

    it("keepfocus false", () => {
      cy.window().then(win => {
        win.$('<button class="dynamic_open">').appendTo("body"); // add dynamic open button
        win.$("#dynamic").popup({ keepfocus: false });
        cy
          .get(".dynamic_open")
          .focus()
          .click();
        cy.focused().should("not.have.id", "dynamic"); // check if popup gets focus
      });
      cy.window().then(win => {
        win.$(".dynamic_open").remove(); // remove dynamic open button
      });
    });

    it("focuselement", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ focuselement: "#dynamic-dummy-input", autoopen: true });
      });
      cy.focused().should("have.attr", "id", "dynamic-dummy-input");
    });

    it("focusdelay", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ focusdelay: 30, outline: true, autoopen: true });
      });
      cy.get("#dynamic").should("have.css", "outline-style", "none");
      cy.wait(60);
      cy.log(
        "IMPORTANT: This test might fail if Cypress UI window is not in focus. Re-run tests with the window in focus, or without Cypress UI (i.e.headless)."
      );
      cy
        .get("#dynamic", { timeout: 10 })
        .should("have.css", "outline-style", "solid");
    });

    it("pagecontainer", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ pagecontainer: "#pagecontainer", autoopen: true });
      });
      cy.get("#pagecontainer").should("have.attr", "aria-hidden", "true");
      cy.get("#dynamic").should("have.attr", "aria-hidden", "false");
    });

    it("outline true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ outline: true, autoopen: true });
      });
      cy.log(
        "IMPORTANT: This test might fail if Cypress UI window is not in focus. Re-run tests with the window in focus, or without Cypress UI (i.e.headless)."
      );
      cy.get("#dynamic").should("have.css", "outline-style", "solid");
    });

    it("outline false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ outline: false, autoopen: true });
      });
      cy.get("#dynamic").should("have.css", "outline-style", "none");
    });

    it("detach true", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ detach: true });
      });
      cy.get("#dynamic").should("not.exist");
    });

    it("detach false", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ detach: false });
      });
      cy.get("#dynamic").should("exist");
    });

    it("openelement", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ openelement: "[data-dummy-input]" });
      });
      cy.get("[data-dummy-input]").click();
      cy.get("#dynamic").should("be.visible");
    });

    it("openelement default", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({});
      });
      cy.get("[data-dummy-input]").click();
      cy.get("#dynamic").should("be.hidden");
    });

    it("closeelement", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ closeelement: "#dynamic-dummy-input", autoopen: true });
      });
      cy.get("#dynamic-dummy-input").click();
      cy.get("#dynamic").should("be.hidden");
    });

    it("closeelement default", () => {
      cy.window().then(win => {
        win.$("#dynamic").popup({ autoopen: true, closebutton: true });
      });
      cy.get("#dynamic-dummy-input").click();
      cy.get("#dynamic").should("be.visible");
      cy.get(".dynamic_close").click();
      cy.get("#dynamic").should("be.hidden");
    });

    it("transition", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({ transition: "all 1s ease 0s", autoopen: true });
      });
      cy
        .get("#dynamic_background")
        .should("have.css", "transition", "all 1s ease 0s");
    });

    it("tooltipanchor", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({
            tooltipanchor: "#dummy-input",
            horizontal: "leftedge",
            vertical: "top",
            type: "tooltip",
            autoopen: true
          });
        cy.get("#dynamic_wrapper").should(
          "have.css",
          "left",
          win
            .$("#dummy-input")
            .offset()
            .left.toFixed(3) + "px"
        );
      });
    });

    it("tooltipanchor default (button visible)", () => {
      cy.window().then(win => {
        win.$('<button class="dynamic_open">').appendTo("body"); // add dynamic open button
        win
          .$("#dynamic")
          .popup({ type: "tooltip", horizontal: "leftedge", autoopen: true });
        cy
          .get("#dynamic_wrapper")
          .should(
            "have.css",
            "left",
            win.$(".dynamic_open").offset().left + "px"
          );
        win.$(".dynamic_open").remove(); // remove dynamic open button
      });
    });

    it("tooltipanchor default (button invisible)", () => {
      cy.window().then(win => {
        win
          .$("#dynamic")
          .popup({
            type: "tooltip",
            horizontal: "leftedge",
            vertical: "bottom",
            autoopen: true
          });
        cy
          .get("#dynamic_wrapper")
          .should("have.css", "left", "0px")
          .should("have.css", "top", "0px");
      });
    });
  });

  context("Methods", () => {
    before(() => {
      cy.visit("/cypress/index.html");
    });

    it(".show()", () => {
      cy.window().then(win => {
        win.$("#default").popup("show");
      });
      cy.get("#default").should("be.visible");
    });

    it(".hide()", () => {
      cy.window().then(win => {
        win.$("#default").popup("hide");
      });
      cy.get("#default").should("be.hidden");
    });

    it(".toggle()", () => {
      cy.window().then(win => {
        win.$("#default").popup("toggle");
      });
      cy.get("#default").should("be.visible");
    });

    it(".toggle() once more", () => {
      cy.window().then(win => {
        win.$("#default").popup("toggle");
      });
      cy.get("#default").should("be.hidden");
    });

    it("TODO: .addclosebutton()", () => {
      cy.window().then(win => {
        win.$("#tooltip").popup("show");
      });
      // cy.get(".tooltip_close").should("not.exist");
      cy.window().then(win => {
        win.$("#tooltip").popup("addclosebutton");
      });
      // cy.get(".tooltip_close").should("exist");
      cy.get(".tooltip_close").click();
    });

    it.skip("TODO: .reposition()", () => {});

    it.skip("TODO AND IMPLEMENT: .destroy()", () => {});

    it.skip("TODO: $.fn.popup.destroyall()", () => {});
  });

  context("Multiple Instances", () => {
    before(() => {
      cy.visit("/cypress/index.html");

      cy.window().then(win => {
        win.$("#default").popup();
        win.$("#tooltip").popup({
          type: "tooltip"
        });
        win.$("#locked").popup({
          scrolllock: true,
          autozindex: true
        });
        win.$("#custom").popup({
          background: false,
          escape: false,
          blur: false,
          setzindex: false,
          autozindex: true,
          scrolllock: true,
          closebutton: true,
          outline: true,
          detach: true
        });
      });
    });

    it("1. unlocked + locked", () => {
      cy.get("[data-default-open]").click();
      cy.get("[data-custom-open-from-popup]").click();
      cy.get("body").should("have.css", "overflow", "hidden");
    });

    it("1a. unlocked - locked", () => {
      cy.get("[data-custom-close]").click();
      cy.get("body").should("have.css", "overflow", "visible");
      cy.get("[data-default-close]").click();
    });

    it("2. locked + locked ", () => {
      cy.get("[data-custom-open]").click();
      cy.get("[data-locked-open-from-popup]").click();
      cy.get("body").should("have.css", "overflow", "hidden");
    });

    it("2a. locked - locked ", () => {
      cy.get("[data-locked-close]").click();
      cy.get("body").should("have.css", "overflow", "hidden");
      cy.get("[data-custom-close]").click();
    });

    it("3. locked + unlocked", () => {
      cy.get("[data-custom-open]").click();
      cy.get("body").should("have.css", "overflow", "hidden");
      cy.window().then(win => {
        win.$("#default").popup("show");
      });
      cy.get("body").should("have.css", "overflow", "hidden"); // if at least one overlay is locked, scrolling should be locked
    });

    it("3a. locked - unlocked", () => {
      cy.window().then(win => {
        win.$("#default").popup("hide");
      });
      cy.get("body").should("have.css", "overflow", "hidden");
    });

    it("all windows closed, body should be unlocked", () => {
      cy.get("[data-custom-close]").click();
      cy.get("body").should("have.css", "overflow", "visible");
    });
  });

  context("Misc.", () => {
    it("TODO: check tabindex and other features from README!!!", () => {});
  });
});
