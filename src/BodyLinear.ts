
export class BodyLinear {

    position: number = 0;
    velocity: number = 0;
    prevPos: number = 0;
    prevVel: number = 0;

    mass: number = 1;
    invMass: number;

    force: number = 0.0;

    constructor() {
        this.setMass(1);
    }

    setMass(mass: number) {
        this.mass = mass;
        this.invMass = 1 / this.mass

        return this;
    }

    setForce(force: number) {
        this.force = force;
        return this;
    }

    applyForce(force: number) {
        this.force += force;
        return this;
    }

    integrate(h: number) {
        this.prevPos = this.position;

        this.velocity += this.force * this.invMass * h;

        this.position += this.velocity * h;
    }

    update(h: number) {
        this.prevVel = this.velocity;

        const dx = (this.position - this.prevPos) / h;

        this.velocity = dx;
    }

    public getInverseMass(): number {
        return this.invMass;
    }

    public applyCorrection(corr: number, velocityLevel = false): void {

        if (velocityLevel)
            this.velocity += corr * this.invMass;
        else 
            this.position += corr * this.invMass;
    }
}
