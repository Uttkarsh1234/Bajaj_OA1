const submitBtn = document.getElementById("submitBtn");

const results = document.getElementById("results");

const errorDiv = document.getElementById("error");

submitBtn.addEventListener(

"click",

async () => {

try{

results.innerHTML="";

errorDiv.innerHTML="";

const input = document

.getElementById("inputData")

.value;

if(!input.trim()){

errorDiv.innerHTML=

"Please enter some data";

return;

}

const data = input

.split("\n")

.map(item=>item.trim())

.filter(item=>item);

const response = await fetch(

"http://localhost:5000/bfhl",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

data

})

}

);

if(!response.ok){

throw new Error(

"API failed"

);

}

const result =

await response.json();

displayResult(result);

}

catch(error){

errorDiv.innerHTML=

error.message;

}

}

);


function displayResult(data){

    results.innerHTML="";

    displayHierarchies(

    data.hierarchies

    );

    displayInvalid(

    data.invalid_entries

    );

    displayDuplicate(

    data.duplicate_edges

    );

    displaySummary(

    data.summary

    );

}


function displayHierarchies(hierarchies) {

    hierarchies.forEach((item, index) => {

        const card = document.createElement("div");

        card.className = "card";

        let html = `
        
        <h2>Hierarchy ${index + 1}</h2>

        <p><strong>Root:</strong> ${item.root}</p>
        `;

        if (item.has_cycle) {

            html += `

            <p>⚠️ Cycle Detected</p>

            `;

        }

        else {

            html += `

            <p><strong>Depth:</strong> ${item.depth}</p>

            <div class="tree">

            ${renderTree(item.tree)}

            </div>

            `;
        }

        card.innerHTML = html;

        results.appendChild(card);

    });

}


function renderTree(tree) {

    const root = Object.keys(tree)[0];

    let output = root + "\n";

    output += traverse(tree[root], "");

    return output;

}

function traverse(node, prefix) {

    let output = "";

    const children = Object.keys(node);

    children.forEach((child, index) => {

        const isLast = index === children.length - 1;

        const branch = isLast ? "└── " : "├── ";

        output += prefix + branch + child + "\n";

        const nextPrefix = prefix + (isLast ? "    " : "│   ");

        output += traverse(node[child], nextPrefix);

    });

    return output;

}


function displayInvalid(

invalid

){

const card =

document.createElement(

"div"

);

card.className="card";

card.innerHTML=`

<h2>

Invalid Entries

</h2>

<ul>

${invalid

.map(

item=>

`<li>${item}</li>`

)

.join("")}

</ul>

`;

results.appendChild(card);

}


function displayDuplicate(

duplicates

){

const card=

document.createElement(

"div"

);

card.className="card";

card.innerHTML=`

<h2>

Duplicate Edges

</h2>

<ul>

${duplicates

.map(

item=>

`<li>${item}</li>`

)

.join("")}

</ul>

`;

results.appendChild(card);

}


function displaySummary(

summary

){

const card=

document.createElement(

"div"

);

card.className="card";

card.innerHTML=`

<h2>

Summary

</h2>

<p>

Total Trees :

${summary.total_trees}

</p>

<p>

Total Cycles :

${summary.total_cycles}

</p>

<p>

Largest Tree Root :

${summary.largest_tree_root}

</p>

`;

results.appendChild(card);

}