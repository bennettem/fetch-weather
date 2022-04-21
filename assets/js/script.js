// document ready
$(function () {
  var apiKey = "673ac2996a47c0e10a7c6b1271435e3f";

  // array to capture history list

  var historyList = [];

  // use local storage

  function getHistory() {
    var cityHistory = JSON.parse(localStorage.getItem("historyList"));
    if (cityHistory !== null) {
      historyList = cityHistory;
    }
    // add limit to storage
    for (i = 0; i < historyList.length; i++) {
      if (i == 6) {
        break;
      }
    }
  }

  // create vars for city and info card

  var city;
  var currentCard = $(".current-card");
  var newDay = $("#five-day");

  getHistory();

  function getData() {
    currentCard.empty();
    newDay.empty();
    var currentURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&appid=" +
      apiKey +
      "&units=imperial";

    //ajax request

    $.ajax({
      url: currentURL,
      method: "GET",
    }).then(function (response) {
      var currentDate = moment().format("LL");
      var weatherIcon = response.weather[0].icon;
      var weatherIconUrl = $("<img>").attr(
        "src",
        "http://openweathermap.org/img/wn/" + weatherIcon + ".png"
      );
      currentCard.append(weatherIconUrl);
      // add into html city and date
      var currentCity = $("<h3>").html(city + " " + currentDate);
      // prepend
      currentCard.prepend(currentCity);
      //append data into current weather card
      var temperature = response.main.temp;
      currentCard.append(
        $("<p>").html("Temperature: " + temperature + " &deg")
      );
      var humidity = response.main.humidity;
      currentCard.append($("<p>").html("Humidity: " + humidity));
      var windSpeed = response.wind.speed;
      currentCard.append($("<p>").html("Wind Speed: " + windSpeed));
      // need to use lat and lon in order to get UV Index
      var lat = response.coord.lat;
      var lon = response.coord.lon;
      // ajax request getting UV data back
      $.ajax({
        url:
          "https://api.openweathermap.org/data/2.5/uvi?appid=" +
          apiKey +
          "&lat=" +
          lat +
          "&lon=" +
          lon,
        method: "GET",
      }).then(function (response) {
        currentCard.append(
          $("<p>").html("UV Index: <span>" + response.value + "</span>")
        );
        // add in classes for color warnings
        if (response.value <= 2) {
          $("span").attr("class", "btn btn-success");
        }
        if (response.value > 2 && response.value <= 5) {
          $("span").attr("class", "btn btn-warning");
        }
        if (response.value > 5) {
          $("span").attr("class", "btn btn-danger");
        }
      });
      // get forecast data
      function getForecast(lat, lon) {
        // ajax for 5 day forecast
        $.ajax({
          url:
            "https://api.openweathermap.org/data/2.5/forecast?lat=" +
            lat +
            "&lon=" +
            lon +
            "&appid=" +
            apiKey +
            "&exclude=hourly,daily,minutely&units=imperial",
          method: "GET",
        }).then(function (fiveday) {
          // create 5 different class cols for each day
          for (i = 0; i < 5; i++) {
            newDay = $("<div>").attr("class", "card five-day bg-primary");
            $("#five-day").append(newDay);
            var forecastDate = $("<h4>").html(
              moment().add(i, "d").format("MM/DD/YYYY")
            );
            // enter info into card
            var cardBody = $("<div>").attr("card-body card-body-bg");

            var cardWeatherIcon = $("<img>").attr(
              "src",
              "http://openweathermap.org/img/wn/" +
                fiveday.weather[0].icon +
                ".png"
            );
            var cardTemp = $("<p>").html(
              "Temperature: " + fiveday.main.temp + " &deg"
            );
            var cardHum = $("<p>").html("Humidity: " + fiveday.main.humidity);

            //add data to cards
            cardBody.append(cardWeatherIcon, cardTemp, cardHum);
            newDay.append(forecastDate, cardBody);
            // add card to id in html
            $("#five-day").append(newDay);
          }
        });
      }
    });
  }

  //  click function for history
  $("#search-btn").click(function () {
    city = $("#city-name").val();
    getData();
    var historyArray = historyList.includes(city);
    if (historyArray == true) {
      return;
    } else {
      historyList.push(city);
      localStorage.setItem("historyList", JSON.stringify(historyList));
      var historyListBtn = $("<a>").attr({
        class: "list-group-item",
        href: "#",
      });
      historyListBtn.text(city);
      $(".history-list").append(historyListBtn);
    }
  });
  $("list-group-item").click(function () {
    city = $(this).text();
    getData();
  });
  getHistory();
});
