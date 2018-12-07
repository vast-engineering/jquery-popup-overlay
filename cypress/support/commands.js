// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('typeEsc', (shiftKey, ctrlKey) => {
  cy.focused().trigger('keydown', {
    keyCode: 27,
    which: 27,
    shiftKey: shiftKey,
    ctrlKey: ctrlKey
  });
});

Cypress.Commands.add('typeTab', (options = {}) => {
  cy.focused().trigger('keydown', {
      keyCode: 9,
      which: 9,
      shiftKey: options.shiftKey,
      ctrlKey: options.ctrlKey,
      force: options.force
  });
});
