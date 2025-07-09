function connectDivs(div1, div2, line) {
  const p1 = div1.getBoundingClientRect();
  const p2 = div2.getBoundingClientRect();

  const x1 = p1.left + p1.width / 2;
  const y1 = p1.top + p1.height / 2;
  const x2 = p2.left + p2.width / 2;
  const y2 = p2.top + p2.height / 2;

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  line.style.width = `${length}px`;
  line.style.left = `${x1 + 1.5}px`;
  line.style.top = `${y1}px`;
  line.style.transform = `rotate(${angle + (angle > 0 ? -0.5 : +0.5)}deg)`;
  line.querySelector("div").style.transform = `rotate(${angle * -1}deg)`;
}

let points = [];
let pointDiv = [];
let PathCost = [];
let selectedPoint;



function createStage(length,newDiv,PathThePoints){
  const DivStages = document.createElement("div");
  DivStages.classList.add("Stages");
  DivStages.id = "S-" + (length + 1);
  DivStages.append(newDiv);
  PathThePoints.append(DivStages);
}

function AddPoint(no) {
  let Name = prompt("Enter the point Name: ");
  if (Name == "" || Name === null) {
    if (no == 0) {
      AddPoint(no);
      return;
    }
    return;
  }
  Name = Name.toUpperCase();
  Name=Name.substring(0, Math.min(4, Name.length))
  if (points.indexOf(Name) != -1) {
    alert("Point Already Exist:");
    return;
  }
  pointDiv[Name] = [];
  const newDiv = document.createElement("div");
  newDiv.innerHTML = Name;
  newDiv.id = "P-" + Name;
  if (points.length == 0) {
    newDiv.classList.add("start");
  }
  points.push(Name);
  const PathThePoints = document.getElementById("ThePoints");
  if (PathThePoints.children.length <= 1) {
      createStage(PathThePoints.children.length,newDiv,PathThePoints)
  } else {
    const DivStages = document.getElementById(
      "S-" + PathThePoints.children.length
    );
    if(DivStages.childElementCount>=4){
      createStage(PathThePoints.children.length,newDiv,PathThePoints)
    }else{
      DivStages.append(newDiv);
    }
    
  }
  reDrawLine(0);
  SelectorChange()
  ChangeTable(document.getElementById("PointSelect"))
}
function addPathTable(Name) {
  reDrawLine(0);
  let level=document.getElementById("P-" + Name).parentNode.id.split("-")[1]
  const Pointsdetails = document.getElementById("Pointsdetails");
  const div=document.createElement("div");
  div.classList.add("details");
  div.id=`D-${Name}`
  div.innerHTML=`<div class="detailsHead">
                        <p>Point: ${Name}</p>
                        <div>
                            <button onclick='AddPath("${Name}")'>Add Path</button>
                            <button onclick='RemovePoint("${Name}")'>Delete Point</button>
                        </div>
                    </div>
                    <div class="level">
                        <button onclick="levelChange('${Name}',0,this)"><ion-icon name="chevron-back-outline"></ion-icon></button>
                        <span id="levelout">Level: ${level}</span>
                        <button onclick="levelChange('${Name}',1,this)"><ion-icon name="chevron-forward-outline"></ion-icon></button>
                    </div>
                    <div class="detailsTable">
                        <table class="PointerTable" id="T-${Name}">
                            <thead>
                                <th>To</th>
                                <th>Cost</th>
                                <th colspan="2">Action</th>
                            </thead>
                            <tbody>
                                ${getrow(Name)}
                            </tbody>
                        </table>
                    </div>`
  Pointsdetails.replaceChildren(div);
}

function AddPath(From) {
  let To = prompt("Enter the next NODE");
  if (To == "") {
    return;
  }
  To = To.toUpperCase();
  if (From == To) {
    alert("Self Path not allowed");
    return;
  }
  if (points.indexOf(To) == -1) {
    alert("No Such Node");
    return;
  }
  if (pointDiv[From].indexOf(To) != -1) {
    alert("Path Already added");
    return;
  }

  if (pointDiv[To].indexOf(From) != -1) {
    alert("Looping is Not allowed");
    return;
  }
  if (document.getElementById("P-" + To).classList.contains("start")) {
    alert("Cant Return to start");
    return;
  }

  const table = document.getElementById("T-" + From);
  const Tbody = table.querySelector("tbody");
  let none = Tbody.querySelector("#None");
  if (none) {
    none.remove();
  }
  pointDiv[From].push(To);

  let tr = document.createElement("tr");
  tr.id = "tr-" + From + "-" + To;
  let td1 = document.createElement("td");
  td1.innerHTML = To;
  let td2 = document.createElement("td");
  td2.innerHTML =
    '<input type="number" placeholder="Cost of the path" id="Cost" value=0>';
  let td3 = document.createElement("td");
  td3.innerHTML = `<button onclick="SaveCost(this,'${From}','${To}')">Save</button>`;
  let td4 = document.createElement("td");
  td4.innerHTML = `<button onclick="deletePath(this,'${From}','${To}')">Delete</button>`;
  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);
  Tbody.append(tr);

  PathCost[From + "-" + To] = 0;

  let FromPoint = document.getElementById("P-" + From);
  let ToPoint = document.getElementById("P-" + To);
  let line = document.createElement("div");
  line.classList.add("line");
  line.id = "Line-" + From + "-" + To;
  line.innerHTML = "<div>0</div>";
  FromPoint.parentNode.parentNode.parentNode.append(line);
  connectDivs(FromPoint, ToPoint, line);
  reDrawLine(0);
}

function RemovePoint(Point) {
  for (let key in pointDiv) {
    const index = pointDiv[key].indexOf(Point);
    if (index != -1) {
      let line = document.getElementById(key + "-" + Point);
      PathCost[key + "-" + Point] = -1;
      line.remove();
      let Tabletr = document.getElementById("tr-" + key + "-" + Point);
      if (Tabletr.parentElement.childElementCount == 1) {
        let thetr = document.createElement("tr");
        thetr.id = "None";
        thetr.innerHTML = "<td colspan='3'>No Path</td>";
        Tabletr.parentElement.append(thetr);
      }
      Tabletr.remove();
      pointDiv[key] = pointDiv[key].filter((element) => element !== Point);
    }
  }
  pointDiv[Point].forEach((element) => {
    let line = document.getElementById(Point + "-" + element);
    PathCost[Point + "-" + element] = -1;
    line.remove();
  });
  pointDiv[Point] = [];
  let po = document.getElementById("P-" + Point);
  if (po.parentElement.childElementCount == 1) {
    let theid = parseInt(po.parentElement.id.split("-")[1]);

    let changingobj = po.parentElement.parentNode.children;
    for (
      let i = theid;
      i < po.parentElement.parentNode.childElementCount;
      i++
    ) {
      changingobj[i].id = "S-" + i;
    }
    po.parentElement.remove();
  }

  po.remove();

  document.getElementById("D-" + Point).remove();
  points = points.filter((element) => element !== Point);
  reDrawLine(0);
  SelectorChange()
}


function getrow(From){
  if(pointDiv[From]==0){
    return `<tr id='None'><td colspan='3'>No Path</td></tr>`;
  }
  let trs=``;
  pointDiv[From].forEach((element) => {
    let To=element;
    trs+=`<tr id='${"tr-" + From + "-" + To}'>
            <td>${To}</td>
            <td><input type="number" placeholder="Cost of the path" id="Cost" value='${PathCost[From+"-"+To]}'></td>
            <td><button onclick="SaveCost(this,'${From}','${To}')">Save</button></td>
            <td><button onclick="deletePath(this,'${From}','${To}')">Delete</button></td>
          </tr>`;
  });
  return trs;
}

function SaveCost(obj, from, to) {
  cost = parseInt(obj.parentElement.parentElement.querySelector("#Cost").value);
  PathCost[from + "-" + to] = cost;
  document.getElementById(
    "Line-" + from + "-" + to
  ).innerHTML = `<div>${cost}</div>`;
  reDrawLine(0);
}

function deletePath(obj, from, to) {
  reDrawLine(0);
  PathCost[from + "-" + to] = -1;
  document.getElementById("Line-" + from + "-" + to).remove();
  let Tabletr = document.getElementById("tr-" + from + "-" + to);
  if (Tabletr.parentElement.childElementCount == 1) {
    let thetr = document.createElement("tr");
    thetr.id = "None";
    thetr.innerHTML = "<td colspan='3'>No Path</td>";
    Tabletr.parentElement.append(thetr);
  }
  Tabletr.remove();
  pointDiv[from] = pointDiv[from].filter((element) => element !== to);
}

function reDrawLine(no) {
  removeSelected(no);
  const lines = document.querySelectorAll(".line");
  lines.forEach((element) => {
    let value = element.id.split("-");
    let FromPoint = document.getElementById("P-" + value[1]);
    let ToPoint = document.getElementById("P-" + value[2]);
    connectDivs(FromPoint, ToPoint, element);
  });
}

function levelChange(Point, dir, obj) {
  const pointobj = document.getElementById("P-" + Point);
  if (pointobj.classList.contains("start")) {
    alert("Start can't Move");
    return;
  }
  level = 2;
  if (dir == 1) {
    let thisStage = pointobj.parentNode;
    let idvalue = parseInt(thisStage.id.split("-")[1]);
    let next = document.getElementById("S-" + (idvalue + 1));
    if (next) {
      next.appendChild(pointobj);
      let mainObj = pointobj.parentNode.parentNode;
      if (thisStage.childElementCount == 0) {
        for (let i = idvalue; i < mainObj.childElementCount; i++) {
          document.getElementById("S-" + (i + 1)).id = "S-" + i;
        }
        thisStage.remove();
      }
    } else {
      const DivStages = document.createElement("div");
      DivStages.id = "S-" + (idvalue + 1);
      DivStages.classList.add("Stages");
      let mainObj = pointobj.parentNode.parentNode;
      DivStages.appendChild(pointobj);
      mainObj.append(DivStages);
      if (thisStage.childElementCount == 0) {
        for (let i = idvalue; i < mainObj.childElementCount; i++) {
          document.getElementById("S-" + (i + 1)).id = "S-" + i;
        }
        thisStage.remove();
      }
    }
  } else {
    let thisStage = pointobj.parentNode;
    let idvalue = parseInt(thisStage.id.split("-")[1]);
    if (idvalue <= 2) {
      alert("Can't Move to start");
      return;
    }
    let prev = document.getElementById("S-" + (idvalue - 1));
    prev.appendChild(pointobj);
    let mainObj = pointobj.parentNode.parentNode;
    if (thisStage.childElementCount == 0) {
      for (let i = idvalue; i < mainObj.childElementCount; i++) {
        document.getElementById("S-" + (i + 1)).id = "S-" + i;
      }
      thisStage.remove();
    }
  }
  reDrawLine(0);
  obj.parentNode.querySelector("#levelout").innerHTML =
    "Level: " +
    document.getElementById("P-" + Point).parentNode.id.split("-")[1];
}
window.addEventListener("resize", () => reDrawLine(0));

function Answer() {
    let start=document.querySelector(".start").innerHTML
    let out = findSmaller(start);
    out[0].push(start);
    document.getElementById("CostOutput").innerHTML='Travel Cost: '+out[1];    let path=out[0].reverse();
    reDrawLine(1)
    if(path.length>=2){
      for(let i=0;i<path.length-1;i++){
        document.getElementById("Line-"+path[i]+"-"+path[i+1]).classList.add("selected")
      }
    }

}
function findSmaller(value) {
  let Ways = getPaths(value);
  if (Ways.length == 0) {
    return [[], 0];
  }
  let path = 0,
    min = null,
    temppath = [];
  for (let i = 0; i < Ways.length; i++) {
    let mains = findSmaller(Ways[i]);
    mains[1]+=PathCost[value + "-" + Ways[i]]
    if (min == null) {
      path = i;
      temppath = mains[0];
      min = mains[1];
    }
    if (min > mains[1]) {
      path = i;
      temppath = mains[0];
      min = mains[1];
    }
  }
  // min = min + PathCost[value + "-" + Ways[path]];
  temppath.push(Ways[path]);
  return [temppath, min];
}
function getPaths(value){
  return pointDiv[value];
}

function removeSelected(no){
  document.querySelectorAll(".selected").forEach((element)=>{
    element.classList.remove("selected");
  });
  if(no==0){
    document.getElementById("CostOutput").innerHTML=''
  }
}

function SelectorChange(){
  option=``;
  points.sort();
  points.forEach((element)=>{
    option+=`<option value="${element}" ${(element==selectedPoint)?"SELECTED":""}>Point: ${element}</option>`;
  })
  document.getElementById("PointSelect").innerHTML=option;
  
}

function ChangeTable(obj){
  selectedPoint=obj.value
  addPathTable(selectedPoint);
}


AddPoint(0)