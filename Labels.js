const LABEL_NAME_SPAM = "SPAM"
const LABEL_NAME_INBOX = "INBOX"

function GetUserLabels(byid) {
  let userlabels = {}
  let labels = Gmail.Users.Labels.list("me")
  if (labels.labels && labels.labels.length > 0) {
    labels.labels.forEach(label => {
      let newlabel = null
      if (label.type == "user") {
        newlabel = new UserLabel(label.id, label.name)
      }
      else {
        newlabel = new UserLabel(label.id, label.name)
      }
      if (newlabel) {
        if (byid) {
          userlabels[`ID:${newlabel.id}`] = newlabel
        }
        else {
          userlabels[newlabel.name] = newlabel
        }
      }
    })
  }
  return userlabels
}


