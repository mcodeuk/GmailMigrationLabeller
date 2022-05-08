const PAGE_SIZE = 50
const MAX_RUN_TIME = 4 * 60000
const MAX_MESSAGES = 99999

const SPREADSHEETID = "SPREADSHEETID"
const SHEETNAME = "SHEETNAME"
const PAGETOKEN = "PAGETOKEN"
const SENDERLABEL = "SENDERLABEL"
const RECEIVERLABEL = "RECEIVERLABEL"
const FINAL = "FINAL"
const AUTOREMOVEINBOX = true
const ADJUSTLABELS = ["SENT", "DRAFT"]
const SCRIPTAUTHOR = "AUTHOREMAIL ADDRESS"

/**
 * The Run Sender Function Must be executed on the Sending Account
 * This will collect from all emails the following information
 * - Subject
 * - Read State - Read or Unread
 * - Global Message Id - Allows for Checking Email between two systems
 * - Label Names - The Label Names to apply on the Receiver side
 * This information will be placed into the Google Sheet for reading by the other Account
 * 
 */
function RunSender() {
  if (userproperties.GetFinal()) {
    Logger.log(`Run aborted as reached end of mail box`)
  }
  else {
    if (userproperties.propertiesOK) {
      if (userproperties.LockScript(5000)) {
        Logger.log("Sender processing starts with lock")
        let sender = new SenderClass()
        sender.RetrieveAllMessages()
      }
      else {
        Logger.log("Sender aborted as Script is already locked")
      }
    }
    else {
      Logger.log(`Error : You Must Run Your Properties_YOURFIRSTNAME Function First!!!!`)
    }
  }
}

/**
 * The Run Receiver Function Must be executed on the receiving Account
 * This will read the Google Sheet and try to locate the email message
 * using the Global Message Id
 * If found then it will set the Read/Unread state and apply the labels
 * If a label is not found then it will be created
 * 
 */
function RunReceiver() {
    if (userproperties.GetFinal()) {
    Logger.log(`Run aborted as reached end of mail box`)
  }
  else {
    if (userproperties.propertiesOK) {
      if (userproperties.LockScript(5000)) {
        Logger.log("Receiver processing starts with lock")
        let receiver = new ReceiverClass()
        receiver.ProcessSenderData()
      }
      else {
        Logger.log("Receiver aborted as Script is already locked")
      }
    }
    else {
      Logger.log(`Error : You Must Run Your Properties_FIRSTNAME Function First!!`)
    }
  }
}

function Properties_USERNAME() {
  let userprops = PropertiesService.getUserProperties()
  userprops.deleteAllProperties()
  userprops.setProperty(SPREADSHEETID,"ENTER SPREADSHEET ID HERE")
  userprops.setProperty(SHEETNAME,"ENTER NAME OF SHEET WITHIN SPREADSHEET HERE")
  userprops.setProperty(SENDERLABEL,"all")
  userprops.setProperty(RECEIVERLABEL, "ENTER LABEL OF WHERE NEW EMAILS ON RECEIVING SIDE ARE TAGGED or all")
}

