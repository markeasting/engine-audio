import { Body } from "./Body";

export class Constraint {

    public body0: Body;
    public body1: Body;

    public compliance = 0.0; // [meters / Newton] -- inverse of 'stiffness' (N/m)
    public lambda = 0.0; 

    public damping = 0.0;

    public theta0: number;
    public theta1: number;

    constructor(body0: Body, body1: Body, compliance = 0.0, damping = 0.0) {
        this.body0 = body0;
        this.body1 = body1;

        this.compliance = compliance;
        this.damping = damping;

        this.setBaseTheta();
    }

    public setBaseTheta() {
        this.theta0 = this.body0.theta;
        this.theta1 = this.body1.theta;
    }
    
    // m/N
    public setCompliance(compliance: number) {
        this.compliance = Math.max(0.00001, compliance);
        return this;
    }
    
    // N/m
    public setStiffness(stiffness: number) {
        this.compliance = 1/stiffness;
        return this;
    }

    public setDamping(damping: number) {
        this.damping = damping;
        return this;
    }

    public getForce(h: number) {
        return h > 0 ? this.lambda / (h * h) : 0;
    }

    public solvePos(h: number, ratio = 1) {

        const dTheta0 = this.body0.theta - this.theta0;
        const dTheta1 = this.body1.theta - this.theta1;

        const corr = (
                (dTheta1 * ratio) // Wheel
            -   (dTheta0) // Engine
        );
        
        this.applyBodyPairCorrection(corr, h, false);
    }

    public solveVel(h: number) {

        let omega = 0.0;

        omega -= this.body0.omega;
        omega += this.body1.omega;
        omega *= Math.min(1.00, this.damping * h);

        this.applyBodyPairCorrection(omega, h, true);

    }

    protected applyBodyPairCorrection(
        corr: number,
        h: number,
        velocityLevel: boolean = false
    ): number
    {

        return Constraint.applyBodyPairCorrection(this.body0, this.body1, corr, this.compliance, h, velocityLevel);
        // const C = corr;

        // if (Math.abs(C) < 0.000001)
        //     return 0;

        // let n = 1;

        // const w0 = this.body0.getInverseMass();
        // const w1 = this.body1.getInverseMass();

        // const w = w0 + w1;
        // if (w == 0.0)
        //     return 0;

        // const compliance = velocityLevel ? 0.0 : this.compliance
        // const dlambda = -C / (w + compliance / h / h);
        // n *= -dlambda;

        // this.body0.applyCorrection(n, velocityLevel);
        // this.body1.applyCorrection(n * -1.0, velocityLevel);

        // return dlambda;
    }



    static applyBodyPairCorrection(
        body0: Body,
        body1: Body,
        corr: number,
        compliance: number,
        h: number,
        velocityLevel: boolean = false
    ): number
    {

        const C = corr;

        if (Math.abs(C) < 0.00001)
            return 0;

        let n = 1;

        const w0 = body0.getInverseMass();
        const w1 = body1.getInverseMass();

        const w = w0 + w1;
        if (w == 0.0)
            return 0;

        const _compliance = velocityLevel ? 0.0001 : compliance
        const dlambda = -C / (w + _compliance / h / h);
        n *= -dlambda;

        body0.applyCorrection(n, velocityLevel);
        body1.applyCorrection(n * -1.0, velocityLevel);

        return dlambda;
    }
}
