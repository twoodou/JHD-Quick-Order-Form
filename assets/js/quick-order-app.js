  var itemNo = 0;
  var key;
  //   var recentKey;
  var uniqueIdentifier;
  var jsonData;
  var availableProducts = [];
  var colors = [];
  var monoStyles = [];
  var symbols = [];
  // Initialize Firebase
  var config = {
      apiKey: "AIzaSyDhWVA9ydqfMSNLHD2huIHfgo_xLL1znxI",
      authDomain: "jhd-quick-order-form.firebaseapp.com",
      databaseURL: "https://jhd-quick-order-form.firebaseio.com",
      projectId: "jhd-quick-order-form",
      storageBucket: "jhd-quick-order-form.appspot.com",
      messagingSenderId: "417642183917"
  };
  firebase.initializeApp(config);

  var orderData = firebase.database();

  var traditionalSelected = false;

  $(document).ready(function () {
      //   Color Dropdown
      $("#input-color").on("change", function () {
          var itemCodeColor = $("#input-color").val().split(",");
          const currentItemCode = $("#input-code").val();
          $("#input-code").empty();
          $("#input-code").val(currentItemCode + itemCodeColor[1]);
          console.log(availableProducts);
      });
      //   Monogram Style Dropdown =-=-=-=-=-=-=-=-=-
      $("#input-monoStyle").on("change select", function () {
          var optionValue = $(this).val();
          if (optionValue == 304 || optionValue == 305 || optionValue == 306) {
              traditionalSelected = true;
              $("#input-personalization").attr("maxlength", 3).prop("disabled", false);
              $("#input-personalization").val("");
              $("#input-symbol").prop("disabled", false);
          } else if (optionValue == 394) {
              console.log("EVENT - 'NONE' Mono Style Selected");
              traditionalSelected = false;
              $("#input-personalization").val("");
              $("#input-personalization").prop("disabled", true);
              $("#input-symbol").prop("disabled", true);
          } else {
              traditionalSelected = false;
              $("#input-personalization").attr("maxlength", 3).prop("disabled", false);
              $("#input-personalization").val("");
              $("#input-symbol").prop("disabled", false);
          }
      });

      //   Symbol Input =-=-=-=-=-=-=-=--=-=-=-=-==-=-
      $("#input-symbol").on("change", function () {
          var optionValue = $(this).val();
          var monoStyleOption = $("#input-monoStyle").val();
          var personalizationText = $("#input-personalization").val();
          if (optionValue == 415 && monoStyleOption != 394) {
              $("#input-personalization").prop("disabled", false);
          } else {
              $("#input-personalization").val("");
              $("#input-personalization").prop("disabled", true);
          }
      });

      //   Personalization Text Input =-=-=-=-=-=-=-=-
      $("#input-personalization").on("change keyup", function () {
          var optionValue = $(this).val();
          var lettersUsed = parseInt(optionValue.length);
          if (lettersUsed > 0) {
              console.log(lettersUsed);
              $("#input-symbol").prop("disabled", true);
              if (traditionalSelected === true) {
                  $("#input-personalization").val(optionValue.toUpperCase());
              }
          } else {
              $("#input-symbol").prop("disabled", false);
          }
          // console.log(lettersUsed + " letters used");
          //   var UPs = optionValue.replace(/[^A-Z]/g, "").length;
          //   var size = (UPs > 2 ? sizes[1] : sizes[0]);
      });

      $("#input-item").on("change", function () {
          var itemName = $(this).val();
          lookupItemCode(itemName);
      });

      $("#quick-order-reset").on("click", function () {
          loadDefaultOptions();
      });

      $("#step2").hide();

      $("#step1-submit").on("click", function () {
          if ($("#input-companyName").val() && $("#input-PO").val()) {
              const randomNumber = Math.floor(Math.random() * 1000000);
              var companyName = $("#input-companyName").val();
              var poNumber = $("#input-PO").val();
              uniqueIdentifier = companyName + "-" + poNumber + "-" + randomNumber;
              var newPO = {
                  uniqueIdentifier: uniqueIdentifier,
                  companyName: companyName,
                  poNumber: poNumber
              };
              var newDB = orderData.ref().child("orders").push(newPO);
              key = newDB.key;
              console.log("KEY: " + newDB.key);
              $("#step1").hide();
              $("#step2").show();
              loadDefaultOptions();
              getFirstJSON();
          } else {
              alert("Please input Company Name and PO Number to continue.");
          }
      });

      $("#quick-order-add").on("click", function () {
          itemNo++;
          var item = $("#input-item").val();
          var itemCode = $("#input-code").val();
          var itemPrice = $("#input-price").val();
          var itemColor = $("#input-color option:selected").text();
          var itemMonoStyle = $("#input-monoStyle option:selected").text();
          var itemSymbol = $("#input-symbol option:selected").text();
          var itemText = $("#input-personalization").val();
          var itemQuantity = $("#input-quantity").val();
          var calcPrice = parseInt(itemPrice.split("$")[1]) * parseInt(itemQuantity);

          console.log("itemColor: " + itemColor);
          console.log("itemMonoStyle: " + itemMonoStyle);
          console.log("itemSymbol: " + itemSymbol);

          var newOrder = {
              itemNo: itemNo,
              itemName: item,
              itemCode: itemCode,
              itemPrice: itemPrice,
              itemColor: itemColor,
              monoStyle: itemMonoStyle,
              itemSymbol: itemSymbol,
              itemText: itemText,
              quantity: itemQuantity,
              totalLinePrice: calcPrice
          };

          var newOrderObject = orderData.ref("orders/" + key).push(newOrder);
          var recentKey = newOrderObject.key;
          getFirebaseData(recentKey);

          //   console.log(newOrder.itemName);
          //   console.log(newOrder.itemCode);
          //   console.log(newOrder.itemPrice);
          //   console.log(newOrder.itemColor);
          //   console.log(newOrder.monoStyle);
          //   console.log(newOrder.itemSymbol);
          //   console.log(newOrder.itemText);
          //   console.log(newOrder.quantity);

          alert("Item Successfully Added");

          loadDefaultOptions();

          return false;

      });

      function loadDefaultOptions() {
          $("#input-item").val("");
          $("#input-code").val("");
          $("#input-code").prop("disabled", true);
          $("#input-price").val("");
          $("#input-price").prop("disabled", true);
          $("#input-color").val("");
          $("#input-monoStyle").val("");
          $("#input-symbol").val("");
          $("#input-symbol").prop("disabled", true);
          $("#input-personalization").val("");
          $("#input-personalization").prop("disabled", true);
          $("#input-quantity").val("");
      }

      function lookupItemCode(itemName) {
          var PCode;
          var PCodeLastLetters;
          var PColorCalculated;
          var PColors;
          var PMonoStyles;
          var PSymbols;
          for (let i = 0; i < jsonData.Products.length; i++) {
              if (jsonData.Products[i].productname === itemName) {
                  // console.log("Match!: " + jsonData.Products[i].productcode);
                  PCode = jsonData.Products[i].productcode;
                  PPrice = jsonData.Products[i].discountedprice_level1;
                  $("#input-code").val(PCode);
                  $("#input-price").val("$ " + PPrice + ".00");
                  PCodeLastLetters = PCode[PCode.length - 2] + PCode[PCode.length - 1];
                  PColorCalculated = jsonData.Products[i].productname.split(" - ");
                  console.log(PColorCalculated.length);
                  if (PColorCalculated.length === 2) {
                      $("#input-color").empty();
                      // $("#input-color").append($('<option>', {
                      //     value: PColorCalculated[1]
                      // }));
                      $('#input-color').append('<option>' + PColorCalculated[1] + '</option>');
                      $("#input-color").prop("disabled", true);
                  } else {
                      $("#input-color").val("").prop("disabled", false);
                      lookupColors(itemName);
                  }
                  lookupMonoStyles(itemName);
                  lookupSymbols(itemName);
              }
          }

      }

      function lookupColors(itemName) {
          $.getJSON("./assets/json/Colors.json", function (data) {
              var womensLeatherColorsArray = ["Lola", "King's Pad", "Everyday Tote", "Britton Backpack"];
              var allLeatherColorsArray = ["Passport Cover", "Kenedy", "Clear Mini Makeup Case", "Clear Becky", "Airport Chico", "Luggage Tag", "Game Day Tote", "Clear Grande", "Large Laundry Bag"];
              var bocaChicaColorsArray = ["Boca Chica"];
              var huntingItemColorsArray = ["Bird Bag", "Sidekick", "Shotgun Cover", "Rifle Cover", "Small Revolver Case", "Large Revolver Case"];
              var clearBackpackColorsArray = ["Clear Backpack"];
              var JHDoppKitColorsArray = ["JH Dopp Kit"];
              var bridleMahoganyColorsArray = ["McClip"];
              var highlandParkToteColorsArray = ["Highland Park Tote"];
              var sandPrintedColorsArray = ["Diaper Pad"];
              var blackPrintedColorsArray = ["Makeup Case Organizer"];
              var splitItemName = itemName.split(" - ")[0];

              if (_.contains(womensLeatherColorsArray, splitItemName)) {
                  console.log("Women's Leather Colors");
                  colors = data.Colors[0].womensLeatherColors;
                  console.log(colors);
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(allLeatherColorsArray, splitItemName)) {
                  console.log("All Leather Colors");
                  colors = data.Colors[0].leatherColors;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(bocaChicaColorsArray, splitItemName)) {
                  console.log("Boca Chica Colors");
                  colors = data.Colors[0].bocaChicaColors;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(huntingItemColorsArray, splitItemName)) {
                  console.log("Hunting Colors");
                  colors = data.Colors[0].huntingItemColors;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(clearBackpackColorsArray, splitItemName)) {
                  console.log("Clear Backpack Colors");
                  colors = data.Colors[0].clearBackpackColors;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(JHDoppKitColorsArray, splitItemName)) {
                  console.log("JH Dopp Kit Colors");
                  colors = data.Colors[0].JHDoppKitColorsLeather;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(bridleMahoganyColorsArray, splitItemName)) {
                  console.log("Bridle or Mahogany");
                  colors = data.Colors[0].bridleMahogany;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(highlandParkToteColorsArray, splitItemName)) {
                  console.log("Highland Park Tote Colors");
                  colors = data.Colors[0].highlandParkToteColors;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(sandPrintedColorsArray, splitItemName)) {
                  console.log("Sand Printed Lining");
                  colors = data.Colors[0].sandPrintedLiningColor;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(blackPrintedColorsArray, splitItemName)) {
                  console.log("Black Printed Lining");
                  colors = data.Colors[0].blackLiningColor;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else {
                  console.log("All Vinyl Colors");
                  colors = data.Colors[0].vinylColors;
                  $("#input-color").empty();
                  $.each(colors, function (index, value) {
                      $("#input-color").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              }
          });
      }

      function lookupMonoStyles(itemName) {
          $.getJSON("./assets/json/MonoStyles.json", function (data) {
              var onlyHotStampArray = ["JH Card Case", "JH Key Strap", "JH Duffel", "JH Dopp Kit", "Joe Duffel", "Mercado", "Bird Bag", "Sidekick", "Shotgun Cover", "Revolver Case"];
              var noHotStampArray = ["Lola", "King's Pad", "Everyday Tote", "Britton Backpack", "Clear Mini Makeup Case", "Luggage Tag", "Easyview Organizer"];
              var bocaChicaArray = ["Boca Chica"];
              var splitItemName = itemName.split(" - ")[0];
              // console.log(splitItemName);
              if (_.contains(onlyHotStampArray, splitItemName)) {
                  console.log("Only Hot Stamps");
                  monoStyles = data.MonoStyles[0].onlyHotStamps;
                  $("#input-monoStyle").empty();
                  $.each(monoStyles, function (index, value) {
                      $("#input-monoStyle").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(noHotStampArray, splitItemName)) {
                  console.log("NO Hot Stamps");
                  monoStyles = data.MonoStyles[0].noHotStamps;
                  $("#input-monoStyle").empty();
                  $.each(monoStyles, function (index, value) {
                      $("#input-monoStyle").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(bocaChicaArray, splitItemName)) {
                  console.log("Boca Chica!");
                  monoStyles = data.MonoStyles[0].bocaChica;
                  $("#input-monoStyle").empty();
                  $.each(monoStyles, function (index, value) {
                      $("#input-monoStyle").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else {
                  console.log("All Mono Styles");
                  monoStyles = data.MonoStyles[0].allMonoStyles;
                  $("#input-monoStyle").empty();
                  $.each(monoStyles, function (index, value) {
                      $("#input-monoStyle").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              }
          });
      }

      function lookupSymbols(itemName) {
          $.getJSON("./assets/json/Symbols.json", function (symbolsData) {
              console.log(symbolsData.Symbols[0].noSymbols);
              var noSymbolsArray = ["Wristlet", "Passport Cover", "McClip", "Detachable Shoulder Strap", "Lola", "King's Pad", "Everyday Tote", "Britton Backpack", "Boca Chica", "Kenedy", "JH Card Case", "JH Key Strap", "JH Duffel", "JH Dopp Kit", "Joe Duffel", "Daisy", "Zippered Agenda Refill", "King's Pad Refill", "Diaper Pad", "Cool It Insert", "Makeup Case Organizer", "Cover for 360 Carry On Wheels", "Cover for 360 Large Wheels", "Cover for 360 Super Wheels", "Catalog"];
              var logoOnlyArray = ["Clear Mini Makeup Case", "Becky", "Clear Becky", "ID Wallet", "Airport Chico", "Junior Shave Kit", "Mini Makeup Case", "El Mercado", "Bird Bag", "Sidekick", "Shotgun Cover", "Rifle Cover", "Small Revolver Case", "Large Revolver Case"];
              var splitItemName = itemName.split(" - ")[0];
              // console.log(splitItemName);
              if (_.contains(noSymbolsArray, splitItemName)) {
                  console.log("No Symbols Available for this product");
                  symbols = symbolsData.Symbols[0].noSymbols;
                  $("#input-symbol").empty();
                  $.each(symbols, function (index, value) {
                      $("#input-symbol").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else if (_.contains(logoOnlyArray, splitItemName)) {
                  console.log("JH Jon Hart Logo - Only Stamp Available");
                  symbols = symbolsData.Symbols[0].logoOnly;
                  $("#input-symbol").empty();
                  $.each(symbols, function (index, value) {
                      $("#input-symbol").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              } else {
                  console.log("All Symbols");
                  symbols = symbolsData.Symbols[0].allSymbols;
                  $("#input-symbol").empty();
                  $.each(symbols, function (index, value) {
                      $("#input-symbol").append($('<option>', {
                          value: value,
                          text: index
                      }));
                  });
              }
          });
      }

      function getFirstJSON() {
          // retrieve JSon from external url and load the data inside an array :
          $.getJSON("./assets/json/ProductsJSON.json", function (data) {
              // console.log(data.Products);
              jsonData = data;
              for (let i = 0; i < data.Products.length; i++) {
                  availableProducts.push({
                      "productName": data.Products[i].productname,
                      "productCode": data.Products[i].productcode
                  });
              }

            //   $('#autocomplete').autocomplete({
            //     source: valuesArray,
            //     focus: function( event, ui ) {
            //         $('#div-id').val( ui.item.label );
            //         return false;
            //     },
            //     select: function( event, ui ) {
            //         //add your own action on item select!
            //         $('#add-friend').val('');
            //         return false;
            //     }
             
            // })
            // .data( "autocomplete" )._renderItem = function( ul, item ) {
            //     //define renderer for list
            // return $( "<li></li>" )
            //         .data( "item.autocomplete", item )
            //         .append( "<a>" + item.label + "</a>" )
            //         .appendTo( ul );
            // };
              console.log(availableProducts);
              $("#input-item").autocomplete({
                  //   source: availableProducts.productName
                  source: function (request, response) {
                      response($.map(availableProducts, function (value, key) {
                        //   console.log("response: " + value.productName);
                          return {
                              label: value.productName
                          };
                      }));
                  },
                  focus: function(event, ui) {
                    $('#input-item').val(ui.value.label);
                    return false;
                },
                  // Once a value in the drop down list is selected, do the following:
                  select: function (event, ui) {
                      console.log("ui: " + ui.item.label);
                      $("#input-item").val(ui.item.label);
                      $("#input-item").trigger("change");
                      // place the person.given_name value into the textfield called 'select_origin'...
                    //   $('#search').val(ui.item.first_name);
                      // and place the person.id into the hidden textfield called 'link_origin_id'. 
                    //   $('#link_origin_id').val(ui.item.id);
                      return false;
                  }
              });
          });
      }

      function getFirebaseData(recentKey) {
          orderData.ref("orders/" + key + "/" + recentKey).once("value", function (childSnapshot) {
              console.log(recentKey);
              console.log(childSnapshot.val());

              // Store everything into a variable
              var iNo = childSnapshot.val().itemNo;
              var oName = childSnapshot.val().itemName;
              var oCode = childSnapshot.val().itemCode;
              var oPrice = childSnapshot.val().totalLinePrice;
              var oColor = childSnapshot.val().itemColor;
              var oMonoStyle = childSnapshot.val().monoStyle;
              var oSymbol = childSnapshot.val().itemSymbol;
              var oText = childSnapshot.val().itemText;
              var oQuantity = childSnapshot.val().quantity;

              $("#order-table > tbody").append("<tr><td>" + iNo + "</td><td>" + oName + "</td><td>" + oCode + "</td><td>" +
                  oColor + "</td><td>" + oMonoStyle + "</td><td>" + oSymbol + "</td><td>" + oText + "</td><td>" + oQuantity + "</td><td>$ " + oPrice + ".00</td></tr>");
          });
      }
  });