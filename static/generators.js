function saw(length) {
	// create saw shaped array
	let tempArray = new Array(length);
	let increment = 1 / length
	for (var i = 0; i < length; i++) {
		tempArray[i] = i*increment
	}
	return tempArray;
}

function triangle(length) {
	// create a triangle shaped array
	let tempArray = new Array(length);
	let half = length / 2
	let increment = 1 / half
	tempArray[0] = 0
	for (let t = 1; t < length; t++) {
		tempArray[t] = tempArray[t-1] + increment
		if (t >= half && increment > 0) {
			increment = increment * -1;
		}
	}

	return tempArray;
}

function square(length) {
	// create a square shaped array
	let tempArray = new Array(length)
	for (let i = 0; i<length; i++) {
		tempArray[i] = i < length / 2 ? 1 : 0;
	}
	return tempArray;
}

const TABLE_LENGTH = 513;
const triangleTable = triangle(TABLE_LENGTH);
const sawTable = saw(TABLE_LENGTH);
const squareTable = square(TABLE_LENGTH);

export { triangleTable, sawTable, squareTable }