/*

The Sender Class provides the method to extract the Subject, Message Id and Labels from
the messages for a specific Label.

For a full extraction the LABEL will be all

It will copy a single row per message to the defined Spreadsheet to make sure 
that the receiver has all the information that it needs to label the messages on its side.

*/
class SenderClass {
  constructor() {
    this.nextpagetoken = userproperties.GetPageToken()
    this.sheethandler = new HandleSheet()
  }

  /*
  Retrieve All Messages

  This function is used to retrieve all messages within the defined Label
  The nextpagetoken is retrieved and passed to the underlying routine
  When the elapsed time has exceeded the MAX_RUN_TIME 
  or the page token is empty or we have exceeded the MAX_MESSAGES
  then the loop will terminate
  When the page token is empty the script will set a FINAL flag
  to prevent re-running.
  */
  RetrieveAllMessages() {
    let starttime = Date.now()    
    let totalmessages = this.sheethandler.LastRow() - 1
    let continueloop = true
    while (continueloop) {
      Logger.log(`Starting Retrieve of Messages in Label : ${userproperties.senderlabel} with token ${this.nextpagetoken}`)
      let messages = this.GetMessageInLabel(userproperties.senderlabel, this.nextpagetoken)
      let gmaillabels = GetUserLabels(true)
      messages.forEach(message => {
        message.ResolveLabelIds(gmaillabels)
        this.sheethandler.AddMessageData(message)  
      })
      totalmessages += messages.length
      userproperties.SavePageToken(this.nextpagetoken)
      let stoptime = Date.now()
      let elapsed = stoptime - starttime
      if (elapsed > MAX_RUN_TIME) {
        continueloop = false
      }
      if (this.nextpagetoken == null) {
        continueloop = false
        userproperties.SetFinal(true)
      }
      if (totalmessages > MAX_MESSAGES) {
        continueloop = false
      }
      Logger.log(`Elapsed Time : ${elapsed}, totalmessages : ${totalmessages}`)
    }
  }
  
  deadSenderProcess() {
    let gmaillabels = GetUserLabels(true)
    let currentlist = []
    let sheet = SpreadsheetApp.openById(userproperties.spreadsheetid).getSheetByName(userproperties.sheetname)
    let lastcolumn = sheet.getLastColumn()
    let lastrow = sheet.getLastRow()
    Logger.log(`Spreadsheet has Last Row : ${lastrow}, Column : ${lastcolumn}`)
    if (lastrow == 0 || lastcolumn == 0) {
      sheet.appendRow(["Processed","MessageId","ReadState","LabelList"])
      return null
    }
    if (lastrow == 1) {
      return null
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
        let messageinfo = GetMessageIdsById(msgid, gmaillabels)
        processed = "YES"
        readstate = messageinfo["readstate"]
        labels = messageinfo["labels"].join(",")
        Logger.log(`Processed : ${processed}, ReadState : ${readstate}, Labels : ${labels}, MsgId : ${msgid}`)
        datarow[0] = processed
        datarow[2] = readstate
        datarow[3] = labels
      }
      rownum += 1
    })
    datarange.setValues(values)
    return currentlist
  }

  /*
  Get Messages In Label will retrieve the messages within a specific label
  It uses the nextpagetoken to enable it to proceed through the full list.
  In order to prevent crashing it retrieves a limited number of messages
  */
  GetMessageInLabel(querylabel, token) {
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
          let newmsg = new MessageData(msg.id)
          let getmsg = Gmail.Users.Messages.get("me", msg.id)
          newmsg.labelids = getmsg.labelIds
          newmsg.ResolverMessageInformation()
          messages.push(newmsg)
      })
    }
    return messages
  } 



  }
