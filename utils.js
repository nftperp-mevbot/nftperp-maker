
function generateDistribution(orderCount, skewness, TARGET_ETH) {
    let distribution = [];

    for (let i = 0; i < orderCount; i++) {
        distribution.push(Math.pow(skewness, i));
    }

    const sum = distribution.reduce((acc, val) => acc + val, 0);
    distribution = distribution.map(val => (val / sum) * TARGET_ETH);
    return distribution;
}

function roundUp(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.ceil(num * factor) / factor;
}

function roundDown(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.floor(num * factor) / factor;
}

module.exports = {generateDistribution, roundUp, roundDown};