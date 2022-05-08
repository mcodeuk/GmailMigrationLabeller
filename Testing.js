function testFinalFalse() {
  userproperties.SetFinal(false)
}

function testFinalTrue() {
  userproperties.SetFinal(true)
}

function DisplayProperties() {
  userproperties.ShowUserScriptProperties()
}

function displayAdjustments() {
  ADJUSTLABELS.forEach(labelname => {
    Logger.log(`Adjust Label : ${labelname} to @${labelname}`)
  })
}
