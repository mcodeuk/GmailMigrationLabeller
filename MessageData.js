class MessageData {
  constructor(id) {
    this.msgid = id
    this.globalmsgid = null
    this.readstate = "READ"
    this.subject = ""
    this.labelids = []
    this.labelnames = []
    this.rowid = 0
    this.processed = ""
    this.notfound = false
  }

  UpdateLabels(labelsToRemove) {
    let dellabelids = []
    let newlabelids = this.labelids
    if (this.readstate == "UNREAD") {
      newlabelids.push("UNREAD")
    }
    else {
      dellabelids.push("UNREAD")
    }
    
    if (AUTOREMOVEINBOX) {
      if (newlabelids.includes("INBOX") == false) {
        dellabelids.push("INBOX")
      }
    }
    let jdata = {"addLabelIds":newlabelids}
    if (labelsToRemove != null) {
      let removeLabels = Array.isArray(labelsToRemove) ? labelsToRemove : [labelsToRemove]
      removeLabels.forEach(label => {dellabelids.push(label.id)})
      
    }
    if (dellabelids.length > 0) {
      jdata["removeLabelIds"] = dellabelids
    }
    
    let update = Gmail.Users.Messages.modify(jdata,"me", this.msgid)
    return update != null
  } 

  GetMessageId() {
    let options = {q:`rfc822msgid:${this.globalmsgid}`}
    options["maxResults"] = PAGE_SIZE
    let msgs = Gmail.Users.Messages.list("me",options)
    if (msgs.messages && msgs.messages.length) {
      if (msgs.messages.length == 1) {
        msgs.messages.forEach(msg => {
          this.msgid = msg.id
        })
      }
      else {
        Logger.log(`Error : Message ${this.subject} Global Id : ${this.globalmsgid} has ${msgs.messages.length} entries`)
        this.notfound = true
      }
    }
    else {
      Logger.log(`Error : Message : ${this.subject} Global Id : ${this.globalmsgid} Not Found`)
      this.notfound = true
    }

  }

  ResolverMessageInformation() {
    let message = GmailApp.getMessageById(this.msgid)
    let mhid = message.getHeader("Message-ID")
    if (mhid == null || mhid == "") {
      Logger.log(`Error : Message ${message.getSubject()} has no Message Id`)
    }
    else {
      this.globalmsgid = mhid.slice(1,-1)
    }
    this.subject = message.getSubject()
  }

  ResolveLabelNames(userlabels) {
    this.labelnames.forEach(labelname => {
      if (labelname.length > 0) {
        if (labelname in userlabels) {
          let label = userlabels[labelname]
          this.labelids.push(label.id)
        }
        else {
          let newlabel = new UserLabel("",labelname)
          newlabel.CreateLabel()
          this.labelids.push(newlabel.id)
          userlabels[labelname] = newlabel
        }
      }
    })
  }

  ResolveLabelIds(userlabels) {
    if (this.labelids == null) {
      Logger.log(`Error : Message : ${this.subject} Global Id : ${this.globalmsgid} Has No Labels`)
    }
    else {
      this.labelids.forEach(labelid => {
        let labelname = userlabels[`ID:${labelid}`].name
        if (labelname == "UNREAD") {
          this.readstate = "UNREAD"
        }
        else {
          this.labelnames.push(labelname)
        }
      })
    }
  }
}
