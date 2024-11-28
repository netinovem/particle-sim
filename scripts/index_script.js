// Initialising the canvas
let canvas = document.getElementById("cnvPlayGround");
let ctx = canvas.getContext("2d");

// Setting the width and height of the canvas
canvas.width = document.getElementById("cnvContainer").offsetWidth;
canvas.height = document.getElementById("cnvContainer").offsetHeight;

//some usefull parameters:
let areaOfEffect = 120;
let areaOfEffectPrimeX = canvas.width - areaOfEffect;
let areaOfEffectPrimeY = canvas.height - areaOfEffect;
let velocityNerf = 0.8;
let particleSize = 3;
let universalRepelingForce = 0.1;

let particles = new Array();
let selectedParticles = new Array();
let isDragging = false;
let dragStartX, dragStartY;

function particle(x, y, color) {
  //creates a particle object with it's cordinates and color and default velocity which is 0
  return { x: x, y: y, vx: 0, vy: 0, color: color };
}

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
    if (cordA<= areaOfEffect && cordB <= areaOfEffect) {
      return cordA - cordB;
    }

    //2 of 6
    if (cordA>= areaOfEffectPrimeX && cordB >= areaOfEffectPrimeX) {
      return cordA - cordB;
    }

    //3 of 6
    if ((cordA >= areaOfEffect && cordA <= areaOfEffectPrimeX )&&(cordB >= areaOfEffect && cordB <= areaOfEffectPrimeX)) {
      return cordA - cordB;
    }

    //4 of 6
    if ((cordA <= areaOfEffect && cordB >= areaOfEffect) || (cordA >= areaOfEffect && cordB <= areaOfEffect)) {
      return cordA - cordB;
    }

    //5 of 6
    if ((cordA <= areaOfEffectPrimeX && cordB >= areaOfEffectPrimeX) || (cordA >= areaOfEffectPrimeX && cordB <= areaOfEffectPrimeX)) {
      return cordA - cordB;
    }
    // 6 of 6
    if (cordA <= areaOfEffect && cordB >= areaOfEffectPrimeX) {
      return cordA - (cordB - areaOfEffect);
    }
    if (cordA >= areaOfEffectPrimeX && cordB <= areaOfEffect) {
      return -(cordA - (cordB - areaOfEffect));
    }


  } 
  else {
    //1 of 6
    if (cordA<= areaOfEffect && cordB <= areaOfEffect) {
      return cordA - cordB;
    }

    //2 of 6
    if (cordA>= areaOfEffectPrimeY && cordB >= areaOfEffectPrimeY) {
      return cordA - cordB;
    }

    //3 of 6
    if ((cordA >= areaOfEffect && cordA <= areaOfEffectPrimeY )&&(cordB >= areaOfEffect && cordB <= areaOfEffectPrimeY)) {
      return cordA - cordB;
    }

    //4 of 6
    if ((cordA <= areaOfEffect && cordB >= areaOfEffect) || (cordA >= areaOfEffect && cordB <= areaOfEffect)) {
      return cordA - cordB;
    }

    //5 of 6
    if ((cordA <= areaOfEffectPrimeY && cordB >= areaOfEffectPrimeY) || (cordA >= areaOfEffectPrimeY && cordB <= areaOfEffectPrimeY)) {
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

function Life(particleGroup1, particleGroup2, g) {
  for (let i = 0; i < particleGroup1.length; i++) {
    let fx = 0;
    let fy = 0;
    let a = particleGroup1[i];

    for (let j = 0; j < particleGroup2.length; j++) {
      let b = particleGroup2[j];

      //Calculating deltaX & deltaY with Screen Wrap in mind
      let deltaX = GetLinearDistance(a.x, b.x,true);
      let deltaY = GetLinearDistance(a.y, b.y,false);

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

//Creating particles:
let yellow = Create(400, "yellow");
let red = Create(200, "red");

function Update() {
  Life(red, yellow, 0.02);
  Life(yellow, red, -0.05);
  Life(red, red, 0.4);

  // Apply drag to selected particles
  // if (isDragging) {
  //   let dx = event.clientX - dragStartX;
  //   let dy = event.clientY - dragStartY;
  //   selectedParticles.forEach(particle => {
  //     particle.x += dx;
  //     particle.y += dy;
  //     particle.x = (particle.x + canvas.width) % canvas.width;
  //     particle.y = (particle.y + canvas.height) % canvas.height;
  //   });
  //   dragStartX = event.clientX;
  //   dragStartY = event.clientY;
  // }

  DrawRect(0, 0, canvas.width, canvas.height, "black");

  for (let i = 0; i < particles.length; i++) {
    Draw(particles[i].x, particles[i].y, particles[i].color, particleSize);
  }

  requestAnimationFrame(Update);
}

// Mouse event handlers
// canvas.addEventListener('mousedown', (event) => {
//   isDragging = true;
//   dragStartX = event.clientX;
//   dragStartY = event.clientY;
//   selectedParticles = particles.filter(particle => {
//     let dx = event.clientX - particle.x;
//     let dy = event.clientY - particle.y;
//     return Math.sqrt(dx * dx + dy * dy) < 30;
//   });
// });

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  selectedParticles = [];
});

Update();
