/*

The Receiver Class is used to process the data from the Sender and
to Label the messages found in the Receiver Email

*/

class ReceiverClass {
  constructor() {
    this.nextpagetoken = null  
    this.sheethandler = new HandleSheet()
  }
  
  ProcessSenderData() {
    let starttime = Date.now()    
    let messages = this.sheethandler.GetMessageDataRows()
    var endtime = Date.now()
    let maxidx = messages.length
    if (maxidx == 0) {
      Logger.log("We have no messages, setting Final")
      userproperties.SetFinal(true)
    }
    else {
      Logger.log(`${maxidx} Messages Loaded From Sender at ${endtime - starttime} ms`)
      let continueloop = maxidx > 0
      let idx = 0
      let processcount = 0
      if (maxidx > 0) {
        let gmaillabels = GetUserLabels(false)
        while (continueloop) {
          let msg = messages[idx]
          Logger.log(`Processing Message : ${msg.globalmsgid}`)
          msg.GetMessageId()
          if (msg.notfound == false){
            msg.ResolveLabelNames(gmaillabels)
            Logger.log(`... Label Ids : ${msg.labelids.join(", ")}`)
            if (msg.UpdateLabels(null)) {
              msg.processed = "YES"
              this.sheethandler.MarkMessageAsProcessed(msg)
              processcount += 1
            }
            else {
              Logger.log(`Error : Failed to Label Message : ${msg.subject} Global Id : ${msg.globalmsgid}`)
            }
          }
          else {
            msg.processed = "Missing"
            this.sheethandler.MarkMessageAsProcessed(msg)
            processcount += 1
          }
          idx += 1
          
          if (idx % PAGE_SIZE == 0) {
            endtime = Date.now()
            let elapsed = endtime - starttime
            if (elapsed > MAX_RUN_TIME) {
              continueloop = false
            }
            Logger.log(`Processed : ${processcount} out of ${idx} messages`)
          }
          if (idx == maxidx) {
            Logger.log(`Processed :${processcount} out of ${idx} messages, finished!`)
            continueloop = false
          }
        }
      }
    }
  }

  ReceiverProcess() {
    let currentlist = []
    let sheet = SpreadsheetApp.openById(userproperties.spreadsheetid).getSheetByName(userproperties.sheetname)
    let lastcolumn = sheet.getLastColumn()
    let lastrow = sheet.getLastRow()
    Logger.log(`Spreadsheet has Last Row : ${lastrow}, Column : ${lastcolumn}`)
    if (lastrow == 0 || lastcolumn == 0) {
      sheet.appendRow(["Processed","MessageId","ReadState","LabelList"])
      return currentlist
    }
    if (lastrow == 1) {
      return currentlist
    }
    let datarange = sheet.getRange(2,1,lastrow - 1, 4)
    let values = datarange.getValues()
    let rownum = 2
    values.forEach(datarow => {
      let processed = datarow[0]
      let msgid = datarow[1]
      let readstate = datarow[2]
      let labels = datarow[3]
      if (processed == "") {
        currentlist.push(msgid)
        rownum += 1
      }
      else {
        Logger.log(`Processed : ${processed}, ReadState : ${readstate}, Labels : ${labels}, MsgId : ${msgid}`)
        sheet.deleteRow(rownum)
      }
    })
    return currentlist
  }

  ReceiverList(currentmessageids) {
      //Logger.log(`Current Messages : ${currentmessageids}`)
      let npt = userproperties.GetPageToken()
      let messages = GetMessageIdsInLabel(userproperties.checklabel, npt)
      let sheet = SpreadsheetApp.openById(userproperties.spreadsheetid).getSheetByName(userproperties.sheetname)
      let lastcolumn = sheet.getLastColumn()
      let lastrow = sheet.getLastRow()
      Logger.log(`Spreadsheet has Last Row : ${lastrow}, Column : ${lastcolumn}`)
      messages.forEach(msgid => {
        if (currentmessageids.includes(msgid) == false) {
          // Logger.log(`Message Id : ${msgid}`)
          let newdata = ["",msgid, "",""]
          sheet.appendRow(newdata)
        }
      })
      if (this.nextpagetoken != null) {
        userproperties.SavePageToken(nextpagetoken)
        this.nextpagetoken = null
      }
  }

  GetMessageIdsInLabel(querylabel, token) {
    let options = {q:`in:${querylabel}`}
    if (token != null) {
      options["pageToken"] = token
    }
    options["maxResults"] = PAGE_SIZE
    let msgs = Gmail.Users.Messages.list("me",options)
    let messages = []
    this.nextpagetoken = msgs.nextPageToken
    if (msgs.messages && msgs.messages.length) {
      msgs.messages.forEach(msg => {
          let message = GmailApp.getMessageById(msg.id)
          let mid = message.getId()
          mhid = message.getHeader("Message-ID")
          if (mhid == null || mhid  == "") {
            Logger.log(`Error : Message ${message.getSubject()} has no Message Id`)
          }
          else {
            mhid = mhid.slice(1,-1)
            messages.push(mhid)
          }
      })
    }
    return messages
  } 

}
