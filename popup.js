let water = 0;

const counter = document.getElementById("counter");
const drinkBtn = document.getElementById("drinkBtn");

drinkBtn.addEventListener("click", () => {
    water += 250;
    counter.textContent = `${water} ml`;
});
