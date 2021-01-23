const app = {};


// If one key does not work, please switch to the other
// app.key = `6427fc9871e04ee487db33eed3fb1ab5`;
app.key = `7debc0838f9448d28e05dfd5a681542e`;


app.baseUrl = `https://api.spoonacular.com/recipes`

app.init = () => {
    app.setRandomBackground();
    app.getIngredients();
}

app.numOfBackgroundImages = 10;

app.getRandomNumber = x => Math.floor(Math.random() * x)

app.setRandomBackground = () => {
    const bg = app.getRandomNumber(app.numOfBackgroundImages);
    $('body').css('background-image', `url(./images/image${bg}.jpg)`)
}

app.getIngredients = () => {
    $('form').on('submit', (e) => {
        e.preventDefault();
        const ingredients = ($('input[type=text]').val());
        
        app.searchByIngredients(ingredients);
    })
}

app.searchByIngredients = userInput => {
    
    const getResponse = $.ajax({
        url: `${app.baseUrl}/findByIngredients`,
        method: 'GET',
        dataType: 'json',
        data: {
            apiKey: app.key,
            ingredients: userInput,
            number: 3,
            limitLicense: false,
            ranking: 1,
            ignorePantry: true,
        }
    });
    app.displayRecipeList(getResponse);
}

app.displayRecipeList = searchResult => {
    
    searchResult.done(res => {
        $('.recipes-list').html('');
        for (i in res) {
            const recipe = res[i];
            const usedIngredients = recipe.usedIngredients.map(obj => obj.name);
            const missedIngredients = recipe.missedIngredients.map(obj => obj.name)
            
            const recipeHTML = `
            <div class="recipe">
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="used-ingredients">
            <p>This recipe uses <span class="ingredients">${usedIngredients.join(`, `)}</span> from your list.</p>
            <p>In addition, you may also need <span class="ingredients">${missedIngredients.join(`, `)}</span>.</p>
            </div>
            <button id="${i}">Get link to full recipe</button>
            <div class="link index${i}"></div>
            </div>`;
            
            $('.recipes-list').append(recipeHTML);
            
        }
        
        $('.wrapper').css('padding-top', '20px');
        $('h2').addClass('hidden');
        $('footer').removeClass('hidden');
        const recipeIDs = res.map(obj => obj.id);
        $('.recipe button').click(function () {
            const index = Number($(this).attr('id'));
            app.getLink(recipeIDs[index], index);
        })
    })
}

app.getLink = (id, index) => {

    $.ajax({
        url: `${app.baseUrl}/${id}/information`,
        method: 'GET',
        dataType: 'json',
        data: {
            apiKey: app.key,
            includeNutrition: false
        }
    }).then(recipe => {

        // if sourceName is null, split the sourceUrl to get the domain name of the sourceUrl and use that as source text instead
        const source = (recipe.sourceName === null) ? recipe.sourceUrl.split(`://`)[1].split(`/`)[0] : recipe.sourceName;

        $(`.index${index}`).html(`<h4>View full recipe at <a href="${recipe.sourceUrl}" target="_blank">${source}</a></h4>`);

        // hide the specific button that has been clicked
        $(`#${index}`).addClass('hidden');

    });
}

$(document).ready( () => {
    app.init();
})
