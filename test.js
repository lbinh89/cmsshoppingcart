const pp = [
    {id: 1, name:"aaa"},
    {id: 2, name:"bbb"},
    {id: 3, name:"ccc"},
    {id: 4, name:"ddd"},
];

// const selectpp = pp.find((person) => person.id === 2);
// console.log(`$selectpp`, selectpp);

const arrToMap = (key, arr) => new Map(arr.map((item) => [item[key], item]));

console.log(arrToMap);

const peopleMap = arrToMap("id", pp);

console.log(peopleMap);

const selectpp = peopleMap.get(2);
console.log(selectpp);