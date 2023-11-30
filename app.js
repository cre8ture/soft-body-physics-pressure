// https://arxiv.org/ftp/physics/papers/0407/0407003.pdf
// http://panoramx.ift.uni.wroc.pl/~maq/soft2d/howtosoftbody.pdf

// Soft particle class
class SoftParticle {
    constructor() {
      // Position coordinates
      this.pos = createVector();
  
      // Velocity
      this.vel = createVector();
  
      // Normal vector
      this.normal = createVector();
  
      // Mass
      this.mass = 1;
    }
  
    // Applies a force vector to particle/ Applies a force vector to the particle
    applyForce(force) {

        console.log(force); // Check the force value and type
        // Since F = ma, and a = F/m, we can calculate the acceleration
        let acceleration = force.div(this.mass);
        // Add the acceleration to the velocity
        this.vel.add(acceleration);
    }
    mouseOver() {
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        return d < 10; // 10 is the radius of the particle
    }

  }
  
  // Spring connecting two particles
  class Spring {
    constructor(p1, p2, len) {
      // End particles
      this.p1 = p1;
      this.p2 = p2;
  
      // Rest length
      this.restLength = len;
  
      // Stiffness coefficient
      this.k = 0.2;
    }
  }
  
  // Soft body class
  class SoftBody {
        constructor(particleCount, springLength) {
            this.particles = [];
            this.springs = [];
    
            // Create particles
            for (let i = 0; i < particleCount; i++) {
                let x = random(width);  // Position randomly in the canvas
                let y = random(height);
                let particle = new SoftParticle();
                particle.pos.set(x, y);
                this.particles.push(particle);
            }
    
            // Connect particles with springs
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    let p1 = this.particles[i];
                    let p2 = this.particles[j];
                    let d = dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
                    if (d < springLength) {
                        let spring = new Spring(p1, p2, d);
                        this.springs.push(spring);
                    }
                }
            }
        }
    
  
    // Calculate volume using Gauss's theorem
    // Sum of tetrahedrons between neighboring
    calculateVolume() {
        let volume = 0;
        for (let i = 0; i < this.springs.length; i++) {
            let s = this.springs[i];
    
            // Calculate the area component (based on your model)
            let a = dist(s.p1.pos.x, s.p1.pos.y, s.p2.pos.x, s.p2.pos.y);
            
            // Assuming you need to use the normal for some reason
            let nx1 = s.p1.normal.x;
            let nx2 = s.p2.normal.x;
    
            // Example volume calculation - modify as per your physics model
            volume += 0.5 * a * (nx1 + nx2); // This is just an example
        }
    
        return volume;
    }
    
  
    applySpringForces() {

            // Define the damping coefficient
    let d = 0.1; // Example value, adjust based on your simulation needs

      // Loop through all springs
      this.springs.forEach((s) => {
        // Get particle positions
        let x1 = s.p1.pos;
        let x2 = s.p2.pos;
  
        // Calculate difference, distance
        let dx = x2.sub(x1);
        let dist = dx.mag();
  
        // Get difference in velocities
        let dv = s.p2.vel.sub(s.p1.vel);
  
        // Apply formula (1) from paper
        let fs = (dist - s.restLength) * s.k; // Spring force
        let fd = dv.dot(dx.normalize()) * d; // Damping
  
        // Calculate total force amount and direction
        let f = fs + fd;
        let dir = dx.normalize();
  
        // Apply forces to particles
        s.p1.applyForce(dir.mult(-f));
        s.p2.applyForce(dir.mult(f));
      });
    }
  
    applyGravity() {
      // Update force on each particle
      this.particles.forEach((p) => {
        // Paper section 5.1
        let m = p.mass;
        let g = createVector(0, 0.1 * m);
  
        p.applyForce(g);
      });
    }
  
    updateParticles() {
      // Simple Euler integration
      // Paper section 6
  
      this.particles.forEach((p) => {
        // Update velocity
        p.vel.add(p.force.div(p.mass));
  
        // Update position
        p.pos.add(p.vel);
  
        // Reset forces
        p.force.set(0, 0);
      });
    }
    applyPressureForces() {

        
        let volume = this.calculateVolume(); // Ensure this returns the volume of the soft body
        let pressure = 0.1; // Define the pressure value
    
        this.springs.forEach((s) => {
            // Calculate the distance between the particles at the ends of the spring
            let r12d = dist(s.p1.pos.x, s.p1.pos.y, s.p2.pos.x, s.p2.pos.y);
    
            // Calculate the pressure value
            let pressurev = r12d * pressure * (1.0 / volume);
    
            // Apply the pressure force to the particles
            // Assuming nx and ny represent the direction of the pressure force
            let forceX = s.nx * pressurev;
            let forceY = s.ny * pressurev;
    
            // Create force vectors
            let force1 = createVector(forceX, forceY);
            let force2 = createVector(forceX, forceY);
    
            // Apply forces to particles
            s.p1.applyForce(force1);
            s.p2.applyForce(force2);
        });
    }
    
  
    show() {
      // Set fill and stroke
      fill(127);
      stroke(200);
      strokeWeight(2);
  
      // Loop through springs
      this.springs.forEach((s) => {
        // Get start and end particle positions
        let x1 = s.p1.pos.x;
        let y1 = s.p1.pos.y;
        let x2 = s.p2.pos.x;
        let y2 = s.p2.pos.y;
  
        // Draw spring as line
        line(x1, y1, x2, y2);
      });
  
      // Draw particles as circles
      this.particles.forEach((p) => {
        ellipse(p.pos.x, p.pos.y, 10);
      });
    }
  }

  function mousePressed() {
    // Check each particle to see if it's under the mouse
    for (let particle of softBody.particles) {
        if (particle.mouseOver()) {
            draggedParticle = particle;
            // Optional: You might want to set the velocity to zero
            draggedParticle.vel.set(0, 0);
            break;
        }
    }
}

function mouseReleased() {
    // Release the dragged particle
    draggedParticle = null;
}

  
  // Simulation sketch
  let softBody;
  let draggedParticle = null;


  
  function setup() {
    console.log("started!")
    createCanvas(400, 400);
  
    // Initialize soft body with a specific number of particles and spring length
    softBody = new SoftBody(10, 50); // Example: 10 particles, 50 pixels max spring length
    console.log("softBody", softBody)
  }
  
  function draw() {

    // Apply all forces
    softBody.calculateVolume();
    softBody.applyPressureForces();
    softBody.applySpringForces();
    softBody.applyGravity();
  
    // Update particles
    softBody.updateParticles();
  
    // Render scene
    background(51);

    softBody.show();

     // If a particle is being dragged, update its position to follow the mouse
     if (draggedParticle) {
        draggedParticle.pos.set(mouseX, mouseY);
    }
    
  }
  