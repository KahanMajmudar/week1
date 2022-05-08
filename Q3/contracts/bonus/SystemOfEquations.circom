pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    signal mulSum[n*n];
    signal bSum[n];
    mulSum[0] <== A[0][0] * x[0];
    bSum[0] <== b[0];

    var p = 1;
    var idx = 0;
    var id = 0;

    for(var i=0; i<n; i++) {
        for(var j=0; j<n; j++) {    
            if(idx>0) {
                mulSum[idx] <== mulSum[idx-1] + (A[i][j] * x[j]);
            }
            idx++;
        }
        if(id>0) {
            bSum[id] <== bSum[id-1] + b[i];
        }
        id++;
    }

    component isEqual = IsEqual();
    isEqual.in[0] <== mulSum[n*n-1];
    isEqual.in[1] <== bSum[n-1];

    out <== isEqual.out;
}

component main {public [A, b]} = SystemOfEquations(3);