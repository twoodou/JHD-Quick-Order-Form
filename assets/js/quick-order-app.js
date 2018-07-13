$(document).ready(function () {
    var jsonData;
    var availableProducts = [];
    var colors = [];
    var monoStyles = [];
    var symbols = [];

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
                    $("#input-color").val(PColorCalculated[1]).prop("disabled", true);
                } else {
                    $("#input-color").val("").prop("disabled", false);
                }
            }
        }
        lookupMonoStyles(itemName);
        lookupSymbols(itemName);
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
            }
            else if (_.contains(noHotStampArray, splitItemName)) {
                console.log("NO Hot Stamps");
                monoStyles = data.MonoStyles[0].noHotStamps;
                $("#input-monoStyle").empty();
                $.each(monoStyles, function (index, value) {
                    $("#input-monoStyle").append($('<option>', {
                        value: value,
                        text: index
                    }));
                });
            }
            else if (_.contains(bocaChicaArray, splitItemName)) {
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
            }
            else if (_.contains(logoOnlyArray, splitItemName)) {
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

    // retrieve JSon from external url and load the data inside an array :
    $.getJSON("./assets/json/ProductsJSON.json", function (data) {
        // console.log(data.Products);
        jsonData = data;
        for (let i = 0; i < data.Products.length; i++) {
            availableProducts.push(data.Products[i].productname);
        }
        $("#input-item").autocomplete({
            source: availableProducts
        });
    });

    $(document).on('change blur keypress', '#input-item', function () {
        var itemName = $(this).val();
        lookupItemCode(itemName);
    });

});