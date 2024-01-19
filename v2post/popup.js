alert("your using a downloaded version of Eloni's Email Organizer")

console.log("Icon clicked.");
let globalToken = null; 

let userid = "null";
chrome.identity.getAuthToken({interactive: true}, function(token) {
    if (chrome.runtime.lastError) {
        console.error("Authentication Error:", JSON.stringify(chrome.runtime.lastError, null, 2));
        return;
    }
    
   // console.log("Token retrieved:", token);
    globalToken = token;
    //getMessages(token)
    //GetUserMessage(token)
    getUserId(token)
        .then(userid => {
            console.log("User ID retrieved:", userid.id);
            GetUserLabels(token, userid.id);
            //console.log(userid)
        })

    
});


function getMessages(token, amt) {
    fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults='+amt, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => {
        if (!response.ok) {
            console.log(response.statusText);
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        
        return response.json();
    })
    .then(data => {
        //console.log("Messages retrieved:", data);
        narwe = data.messages
      //  console.log(data)
        narwe.forEach((element) => {
            idofmessage = element.id;
            GetUserMessage(globalToken, idofmessage)
        });

    })
    .catch(error => {
        console.log('Request failed:', error);
    });
}

function getUserId(token) {
    return new Promise((resolve, reject) => {
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
           // console.log("done")
            userid = data;
            resolve(data); // Resolve the promise with the user ID
        })
        .catch(error => {
            reject(error); // Reject the promise if there's an error
        });
    });
}

const lablist = {}
async function GetUserLabels(token, userid) {
   // console.log(userid)
    try {

        
        fetch('https://gmail.googleapis.com/gmail/v1/users/'+userid+'/labels', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        //i need to get the user id 
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
          // console.log(data)
            let newArray = data.labels.filter(e => e.type === 'user').map(e => e.name);
            
            let idnam = data.labels.filter(e => e.type === 'user').map(e => e.id);
          //  console.log(idnam)
            let x = document.getElementById("labels");
            let i = 0
            newArray.forEach(element => {
                
                i = i + 1
                let option = document.createElement("option");
                option.text = element;
                x.add(option);   
                //console.log(idnam)
                lablist[element] = idnam
                //console.log(lablist)
            })
           // console.log(lablist)
            let a = document.getElementById("labels2");
            newArray.forEach(element => {
                
                let option = document.createElement("option");
                option.text = element;
                a.add(option);    
            });
        })
    } catch (error) {
        console.log("Sir! PROBLEM")
    }
}
const toaddkw = {}
const toaddusr = {}
//HERE
//        let amt = document.getElementById('amtt').value;
window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("addkw").addEventListener("click", function(e){
        if (document.getElementById('kw').value == '') {
            alert("please input something");
        } else {
            let kw = document.getElementById('kw').value;
            let labget = document.getElementById("labels2");
            let value = labget.value;
            const para = document.createElement("p");
            const node = document.createTextNode(kw + " kw with label " + value);
            para.appendChild(node);
            const element = document.getElementById("creatediv");
            element.appendChild(para);
            toaddkw[kw] = value;
            document.getElementById('kw').value = ''
        //    console.log(toaddkw);
            
        }
    })
        document.getElementById("addusrgroup").addEventListener("click", function(e){
            if (document.getElementById('usrgroup').value == '') {
                alert("please input something");
            } else {
                let kw = document.getElementById('usrgroup').value;
                let labget = document.getElementById("labels");
                let value = labget.value;
                const para = document.createElement("p");
                const node = document.createTextNode(kw + " user with label " + value);
                para.appendChild(node);
                const element = document.getElementById("creatediv");
                element.appendChild(para);
                toaddusr[kw] = value;
                document.getElementById('usrgroup').value = ''
                //console.log(toaddusr);
                
            }
        })
    document.getElementById("goamtt").addEventListener("click", function(e) {
       // console.log("clicked")
        if (document.getElementById('amtt').value == '') {
            alert("please input something");
        } else {
            let nmacamt = document.getElementById('amtt').value;
          //  console.log(nmacamt)
            getMessages(globalToken, nmacamt)
            document.getElementById('amtt').value = ''
        }
    })
        //addusrgroup
       
      //  let text = a.options[e.selectedIndex].text;
       // alert(value);
        //alert(globalToken)
        //getMessages(globalToken, amt)
        //alert("done");
});


async function cryptcram(token, str, msgid) {
    console.log("ran")
    //  console.log("Ran but not completed?")
    str = str.replace(/\-/g, '+').replace(/_/g, '/');
    const pad = str.length % 4;
    if (pad) {
        str += '='.repeat(4 - pad);
    }

    let bdtx;
    try {
        bdtx = decodeURIComponent(escape(window.atob(str)));
    } catch (error) {
        console.error("Error in decoding base64 string:", error);
        return;
    }

    let kws = Object.keys(toaddkw);
    //console.log(kws);
    //console.log(bdtx);


 //   console.log(toaddkw);
    kws.forEach(element => {
        if (bdtx.includes(element)) {


           // aftr = toaddusr[emal];
           // labid = lablist[aftr];
            aftere = toaddkw[element];
            labbidwabbid = lablist[aftere];
            //console.log(element);
            console.log("inside");
           // console.log(labbidwabbid)
            modifyMessageLabels(globalToken, msgid, labbidwabbid)
        } else {
            console.log("nothing");
        }
    });
  
}

  
async function GetUserMessage (token, idofmessage) {
    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${idofmessage}`, {
            headers: { 'Authorization': 'Bearer ' + token }
    })
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }

    let data = await response.json();
    let msgid = data.id;

    if (data.payload && Array.isArray(data.payload.parts) && data.payload.parts.length > 0 && data.payload.parts[0].body) {
        let bodytext = data.payload.parts[0].body;
        let ascine = bodytext.data;
   
        await cryptcram(globalToken, ascine, msgid);
    }
    await getusers(data);

    //  console.log("after else")
} catch (error) {
    console.log("error in getting user message: ", error.message)
}
}

async function getusers(data) {
    let john = data.payload.headers.filter(e => e.name === 'From').map(e => e.value);
    
    let emals = john[0];
    let emalid = data.id;
    let emal = emals.split('<').pop().split('>')[0]; // Extracts email address

    if (emal in toaddusr) {
        console.log("hit on email");
      //  console.log(toaddusr)
        let aftr = toaddusr[emal];
        let labid = lablist[aftr];

        if (labid) {
            try {
                await modifyMessageLabels(globalToken, emalid, labid);
            } catch (error) {
                console.error("Error in modifyMessageLabels:", error);
            }
        } else {
            console.log("No label ID found for:", emal);
        }
    } else {
        console.log(emal + " is not in the list");
    };
}




async function modifyMessageLabels(authToken, messageId, labid) {
    //console.log(labid)
    const requestBody = {
        "addLabelIds": [
            labid
        ]
    };
    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text(); // Get more detailed error information
            throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody}`);
        }

        const data = await response.json();
        console.log('Message modified:', data);
    } catch (error) {
        console.error('Error modifying message:', error);
    }
}
