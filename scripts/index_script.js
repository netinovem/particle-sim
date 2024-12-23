//ENGINE:
// Initialising the canvas
let canvas = document.getElementById("cnvPlayGround");
let ctx = canvas.getContext("2d");

// Setting the width and height of the canvas
canvas.width = document.getElementById("cnvContainer").offsetWidth;
canvas.height = document.getElementById("cnvContainer").offsetHeight;

//some usefull parameters:
const areaOfEffect = 120;
let areaOfEffectPrimeX = canvas.width - areaOfEffect;
let areaOfEffectPrimeY = canvas.height - areaOfEffect;
const velocityNerf = 0.8;
const particleSize = 3;
const universalRepelingForce = 0.1;
const minValue = -1; // Minimum value for matrix cells
const maxValue = 1; // Maximum value for matrix cells
const increment = 0.1; // Allowed increment for matrix cell values

//important arrays:
let particles = new Array();
let particleGroups = new Array(); // 2D array to hold particles by type
let forceMatrix = new Array(); // To store the force matrix
const colors = [
  "yellow",
  "red",
  "green",
  "aquamarine",
  "purple",
  "orange",
  "lightpink",
  "lightgreen",
];

function particle(x, y, color) {
  //creates a particle object with it's cordinates and color and default velocity which is 0
  return { x: x, y: y, vx: 0, vy: 0, color: color };
}

//hello

function Random(xory) {
  return Math.floor(Math.random() * xory);
}

function Create(number, color) {
  //Creates an Array of particles for a specific color
  let particleGroup = new Array();
  canvas.width, canvas.height;

  for (let i = 0; i < number; i++) {
    particleGroup.push(
      particle(Random(canvas.width), Random(canvas.height), color)
    );
    particles.push(particleGroup[i]);
  }

  return particleGroup;
}

function Draw(x, y, c, s) {
  ctx.beginPath();
  ctx.arc(x, y, s, 0, 2 * Math.PI);
  ctx.fillStyle = c;
  ctx.fill();
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = c;
  // ctx.stroke();
}

function DrawRect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

function Repel(particle1, particle2, distance, deltaX, deltaY) {
  //Avoid division by zero
  if (distance === 0) {
    distance = 0.001; // Or a small value to prevent errors.
  }

  //Strong repulsive force
  let F = universalRepelingForce / distance; //Inverse square law for repulsion

  particle1.vx += F * deltaX;
  particle1.vy += F * deltaY;
  particle2.vx -= F * deltaX; //Equal and opposite reaction
  particle2.vy -= F * deltaY;
}

function GetLinearDistance(cordA, cordB, isXaxes) {
  if (isXaxes) {
    //1 of 6
    if (cordA <= areaOfEffect && cordB <= areaOfEffect) {
      return cordA - cordB;
    }

    //2 of 6
    if (cordA >= areaOfEffectPrimeX && cordB >= areaOfEffectPrimeX) {
      return cordA - cordB;
    }

    //3 of 6
    if (
      cordA >= areaOfEffect &&
      cordA <= areaOfEffectPrimeX &&
      cordB >= areaOfEffect &&
      cordB <= areaOfEffectPrimeX
    ) {
      return cordA - cordB;
    }

    //4 of 6
    if (
      (cordA <= areaOfEffect && cordB >= areaOfEffect) ||
      (cordA >= areaOfEffect && cordB <= areaOfEffect)
    ) {
      return cordA - cordB;
    }

    //5 of 6
    if (
      (cordA <= areaOfEffectPrimeX && cordB >= areaOfEffectPrimeX) ||
      (cordA >= areaOfEffectPrimeX && cordB <= areaOfEffectPrimeX)
    ) {
      return cordA - cordB;
    }
    // 6 of 6
    if (cordA <= areaOfEffect && cordB >= areaOfEffectPrimeX) {
      return cordA - (cordB - areaOfEffect);
    }
    if (cordA >= areaOfEffectPrimeX && cordB <= areaOfEffect) {
      return -(cordA - (cordB - areaOfEffect));
    }
  } else {
    //1 of 6
    if (cordA <= areaOfEffect && cordB <= areaOfEffect) {
      return cordA - cordB;
    }

    //2 of 6
    if (cordA >= areaOfEffectPrimeY && cordB >= areaOfEffectPrimeY) {
      return cordA - cordB;
    }

    //3 of 6
    if (
      cordA >= areaOfEffect &&
      cordA <= areaOfEffectPrimeY &&
      cordB >= areaOfEffect &&
      cordB <= areaOfEffectPrimeY
    ) {
      return cordA - cordB;
    }

    //4 of 6
    if (
      (cordA <= areaOfEffect && cordB >= areaOfEffect) ||
      (cordA >= areaOfEffect && cordB <= areaOfEffect)
    ) {
      return cordA - cordB;
    }

    //5 of 6
    if (
      (cordA <= areaOfEffectPrimeY && cordB >= areaOfEffectPrimeY) ||
      (cordA >= areaOfEffectPrimeY && cordB <= areaOfEffectPrimeY)
    ) {
      return cordA - cordB;
    }
    // 6 of 6
    if (cordA <= areaOfEffect && cordB >= areaOfEffectPrimeY) {
      return cordA - (cordB - areaOfEffect);
    }
    if (cordA >= areaOfEffectPrimeY && cordB <= areaOfEffect) {
      return -(cordA - (cordB - areaOfEffect));
    }
  }
}

// Variables for mouse dragging
let isDragging = false;
let dragStartX, dragStartY;

// Add mouse down event to start dragging
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  dragStartX = e.clientX - rect.left;
  dragStartY = e.clientY - rect.top;
});

// Add mouse up event to stop dragging
canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// Add mouse move event to update drag position and move particles
canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return; // Only update if dragging

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const radius = 200; // Radius within which particles will be affected

  // Move particles within the drag radius
  for (let particle of particles) {
    const deltaX = mouseX - particle.x;
    const deltaY = mouseY - particle.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < radius) {
      // Calculate the movement factor based on the distance from the mouse
      const force = 1 - distance / radius; // Normalized force scaling
      particle.vx += (deltaX / distance) * force * 3; // Adjust force multiplier as needed
      particle.vy += (deltaY / distance) * force * 3; // Adjust force multiplier as needed
    }
  }
});

function Life(particleGroup1, particleGroup2, g) {
  for (let i = 0; i < particleGroup1.length; i++) {
    let fx = 0;
    let fy = 0;

    let a = particleGroup1[i];

    for (let j = 0; j < particleGroup2.length; j++) {
      let b = particleGroup2[j];

      //Calculating deltaX & deltaY with Screen Wrap in mind
      let deltaX = GetLinearDistance(a.x, b.x, true);
      let deltaY = GetLinearDistance(a.y, b.y, false);

      //TODO: OPTIMIZE: there is no need to compute sqrt if distance is 0
      let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      //Collision Detection
      if (distance <= 10 /*particleSize * 2*/) {
        //Collision handeling
        Repel(a, b, distance, deltaX, deltaY);
      }

      //calculates the force between the two particles
      if (distance > 30 && distance < areaOfEffect) {
        let F = -g / distance;
        fx += F * deltaX;
        fy += F * deltaY;
      }
    }

    a.vx = (a.vx + fx) * velocityNerf; //multiplie by 0.5 to reduce velocity
    a.vy = (a.vy + fy) * velocityNerf;
    a.x += a.vx;
    a.y += a.vy;

    // Screen wrap effect
    if (a.x < 0) a.x = canvas.width;
    if (a.x > canvas.width) a.x = 0;
    if (a.y < 0) a.y = canvas.height;
    if (a.y > canvas.height) a.y = 0;
  }
}



// Function to update particles based on the input value
function UpdateParticles() {
  const totalParticles = Number(inpParticleCount.value);
  const numTypes = Math.min(8, Number(inpTypes.value)); // Ensure at least 1 type and max 8
  const particlesPerType = Math.floor(totalParticles / numTypes); // Calculate particles per type

  // Clear existing particles
  particles = []; // Reset the particles array
  particleGroups = Array.from({ length: numTypes }, () => []); // Reset the particleGroups array

  // Create new particles for each type
  for (let i = 0; i < numTypes; i++) {
    const color = colors[i]; // Get specific color based on type index
    const createdParticles = Create(particlesPerType, color); // Create particles with that color

    // Populate particle groups
    particleGroups[i] = createdParticles; // Store the created particles in the grouped array

    // Append the created particles to the main particles array for rendering
    particles.push(createdParticles); // Spread the created particles into the rendering array
  }

  // If there are leftover particles due to integer division, distribute them evenly
  const leftoverParticles = totalParticles % numTypes;
  for (let j = 0; j < leftoverParticles; j++) {
    const color = colors[j]; // Get color for leftover particles
    const createdParticle = Create(1, color); // Create one additional particle for that color

    // Add to the corresponding type array
    for (let index = 0; index < createdParticle.length; index++) {
      particleGroups[j].push(createdParticle[index])
    }

    // Also add to the main particles array for rendering
    particles.push(createdParticle); // Add to rendering array
  }
}

//initializing some starter particles.
particleGroups[0] = Create(Number(document.getElementById("inpParticleCount").value),"yellow");

function Update() {

  //Life(particleGroups[0],particleGroups[0],1);
  
  for (let i = 0; i < forceMatrix.length; i++) {
    for (let j = 0; j < forceMatrix[i].length; j++) {
      Life(particleGroups[i],particleGroups[j],forceMatrix[i][j]);
    }
  }

  DrawRect(0, 0, canvas.width, canvas.height, "black");

  for (let i = 0; i < particles.length; i++) {
    Draw(particles[i].x, particles[i].y, particles[i].color, particleSize);
  }

  requestAnimationFrame(Update);
}
Update();
//ENGINE ENDS

//ui stuff:
let inpParticleCount = document.getElementById("inpParticleCount");
let btnSubtract = document.getElementById("btnSubtract");
let btnAdd = document.getElementById("btnAdd");
let inpTypes = document.getElementById("inpTypes");
let btnSubtractType = document.getElementById("btnSubtractType");
let btnAddType = document.getElementById("btnAddType");

// Function to generate the force matrix based on the number of types
function GenerateMatrix() {
  const numTypes = Number(document.getElementById("inpTypes").value);
  forceMatrix = Array.from({ length: numTypes }, () => Array(numTypes).fill(0)); // Initialize matrix with zeros

  const matrixContainer = document.getElementById("matrixContainer");
  matrixContainer.innerHTML = ""; // Clear previous matrix

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";

  // Create the header row
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // Empty top-left corner cell

  for (let i = 0; i < numTypes; i++) {
    const th = document.createElement("th");
    th.style.textAlign = "center";

    // Create a circle in the header cell
    const topCircle = document.createElement("div");
    topCircle.style.width = "20px";
    topCircle.style.height = "20px";
    topCircle.style.borderRadius = "50%";
    topCircle.style.backgroundColor = colors[i % colors.length];
    topCircle.style.display = "inline-block"; // Ensure circle and number are inline
    topCircle.style.marginBottom = "0";

    th.appendChild(topCircle);
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Create table rows and cells for the matrix
  for (let i = 0; i < numTypes; i++) {
    const row = document.createElement("tr");
    const typeHeader = document.createElement("td");
    typeHeader.style.textAlign = "center";

    // Create a circle in the header cell
    const leftCircle = document.createElement("div");
    leftCircle.style.width = "20px";
    leftCircle.style.height = "20px";
    leftCircle.style.borderRadius = "50%";
    leftCircle.style.backgroundColor = colors[i % colors.length];
    leftCircle.style.marginRight = "5px";
    typeHeader.appendChild(leftCircle);
    row.appendChild(typeHeader);

    for (let j = 0; j < numTypes; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.value = forceMatrix[i][j];
      input.style.width = "50px";
      input.style.height = "50px";
      input.style.textAlign = "center";
      input.classList.add("cell-input");
      input.step = increment;
      input.min = minValue;
      input.max = maxValue;

      // Update the matrix when input changes
      input.addEventListener("input", (e) => {
        forceMatrix[i][j] = Number(e.target.value); // Update matrix value
      });

      cell.appendChild(input);
      cell.style.border = "2px solid #9c528b";
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  //table.style.border = "2px solid #9c528b";
  table.style.borderCollapse = "collapse";
  matrixContainer.appendChild(table);
}

// Event listener for types input change
inpTypes.addEventListener("input", () => {
  // Regenerate force matrix whenever the number of types changes
  if (inpTypes.value === "") {
    inpTypes.value = "0";
  }
  if (Number(inpTypes.value) > 0) {
    GenerateMatrix(); // Call to generate the matrix
  }
});

inpParticleCount.addEventListener("input", () => {
  if (inpParticleCount.value === "") {
    inpParticleCount.value = "0";
  }

  console.log("hi");
  UpdateParticles();
});

btnAdd.addEventListener("click", () => {
  inpParticleCount.value = Number(inpParticleCount.value) + 100;
  UpdateParticles();
});

btnSubtract.addEventListener("click", () => {
  if (Number(inpParticleCount.value) >= 100) {
    inpParticleCount.value = Number(inpParticleCount.value) - 100;
  } else {
    inpParticleCount.value = "0";
  }
  UpdateParticles();
});

btnAddType.addEventListener("click", () => {
  if (Number(inpTypes.value) < 8) {
    inpTypes.value = Number(inpTypes.value) + 1;
  }
  UpdateParticles();
  GenerateMatrix();
});

btnSubtractType.addEventListener("click", () => {
  if (Number(inpTypes.value) > 0) {
    inpTypes.value = Number(inpTypes.value) - 1;
  }
  UpdateParticles();

  GenerateMatrix();
});


GenerateMatrix();
