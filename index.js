const randomRecipeEL = document.querySelector('.random-recipe');
const favoritesItemsEl = document.querySelector('.favorites__items');
const searchText = document.querySelector('.search__text');
const btnSearch = document.querySelector('#btnSearch');
const meals = document.querySelector('.meals');
const popup = document.querySelector('.popup');
const popupContainer = document.querySelector('.popup__container');
const popupClose = document.querySelector('.popup__close');

getRandomMeal();
setFromLocalStorage();

async function getRandomMeal() {
   const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
   const respData = await resp.json();
   const randomMeal = respData.meals[0];
   renderRecipe(randomMeal, true);
}

async function getMealById(mealId) {
   const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + mealId);
   return await resp.json()
}

async function getSearchMealByName(name) {
   const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + name);
   return await resp.json();
}

function renderRecipe(mealData, random = false) {
   const mealEL = document.createElement('div');
   mealEL.classList.add('meals__item');

   mealEL.innerHTML = `
     <div class="meals__img">
      ${random ? `<span class="random-recipe__sticky">Random Recipe</span>` : ''}
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meals__info">
      <p>${mealData.strMeal}</p>
      <button class="meals__btn"><i class="fas fa-heart" data-type="heart" data-id="${mealData.idMeal}"></i></button>
    </div>`;
   mealEL.addEventListener('click', (event) => {
      if (event.target.closest('.meals__item') && event.target.dataset.type !== 'heart') {
         showPopup(mealData);
      }
   })
   random ? randomRecipeEL.append(mealEL) : meals.append(mealEL);
}

function addToLocalStorage(mealId) {
   const mealIds = JSON.parse(localStorage.getItem('mealIds')) || [];
   if (mealIds.includes(mealId)) return
   localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
   setFromLocalStorage();
}

function removeToLocalStorage(mealId) {
   const mealIds = JSON.parse(localStorage.getItem('mealIds')) || [];
   const filterMields = mealIds.filter(id => id !== mealId);
   localStorage.setItem('mealIds', JSON.stringify([...filterMields]));
   setFromLocalStorage();
}

function setFromLocalStorage() {
   favoritesItemsEl.innerHTML = '';
   const mealIds = JSON.parse(localStorage.getItem('mealIds')) || [];

   mealIds.forEach(async (id) => {
      const res = await getMealById(id);
      const meal = res.meals[0];

      const li = document.createElement('li');
      li.classList.add('favorites__item');

      li.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <p>${meal.strMeal}</p>
        <button class="favorites__delete"><i class="fas fa-trash" data-id="${id}" data-type="delete"></i></button>
      `;
      li.addEventListener('click', (event) => {
         if (this && event.target.dataset.type !== 'delete') {
            showPopup(meal);
         }
      })
      favoritesItemsEl.append(li);
   });
}

function showPopup(mealData) {
   const ingredientsAndMeasures = [];
   for (let i = 1; i <= 20; i++) {
      if (mealData['strIngredient' + i]) {
         ingredientsAndMeasures.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`);
      }
   }

   popup.innerHTML = `
  <button class="popup__close"><i class="fas fa-times-circle"></i></button> 
  <div class="popup__header">
      <h3>${mealData.strMeal}</h3>
      <img src="${mealData.strMealThumb}" alt="test">
    </div>
    <p class="popup__info">${mealData.strInstructions}</p>
    <h4>Ingredients:</h4>
    <ul class="popup__ingredients">

      ${ingredientsAndMeasures.map(ing => `<li>${ing}</li>`).join(' ')}
    </ul>
    <a href="${mealData.strYoutube}" target="_blank">How to make (video) <i class="fab fa-youtube"></i></a>`;
   popupContainer.classList.remove('hidden');
}

btnSearch.addEventListener('click', async (event) => {
   meals.innerHTML = '';
   const data = await getSearchMealByName(searchText.value);
   const searchMeals = data.meals || [];
   if (searchMeals.length === 0) {
      meals.innerHTML = `<h2>No results were found for <mark>${searchText.value}</mark></h2>`
   }
   searchMeals.forEach(meal => {
      renderRecipe(meal);
   })
});
// Trigger a Button Click on Enter
searchText.addEventListener("keyup", function (event) {
   if (event.keyCode === 13) {
      event.preventDefault();
      btnSearch.click();
   }
});

document.addEventListener('click', (event) => {
   const target = event.target;
   // remove from favorite
   if (target.dataset.type === 'delete') {
      removeToLocalStorage(target.dataset.id)
   }
   //add and remove to favorite
   if (target.dataset.type === 'heart') {
      target.parentElement.classList.toggle('active');
      if (target.parentElement.classList.contains('active')) {
         addToLocalStorage(target.dataset.id)
      } else {
         removeToLocalStorage(target.dataset.id)
      }
   }
   //close popup
   if (target.parentElement.classList.contains('popup__close') || target.classList.contains('popup__container')) {
      popupContainer.classList.add('hidden');
   }

})



