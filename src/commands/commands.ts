/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 */

// Office.js needs to be referenced before using Office namespace
// @ts-ignore
Office.onReady(info => {
  // If needed, Office.js is ready to be called
  console.log(`Office.js is now ready in ${info.host} on ${info.platform}`);
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event 
 */
function showTaskpane(event: Office.AddinCommands.Event) {
  // Display the task pane
  Office.addin.showAsTaskpane();
  event.completed();
}

/**
 * Exports extracted OCR data to the current worksheet.
 * This is a placeholder for future functionality.
 * @param event 
 */
function exportToWorksheet(event: Office.AddinCommands.Event) {
  Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.getRange("A1").values = [["This functionality is not implemented yet."]];
    await context.sync();
  }).catch((error) => {
    console.error(error);
  });

  event.completed();
}

// Add event handlers here
// @ts-ignore
Office.actions.associate("showTaskpane", showTaskpane);
// @ts-ignore
Office.actions.associate("exportToWorksheet", exportToWorksheet); 