
const getPairName = (cardsList) => {
    // const cardlis = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
    let cards = "";
    let suits = "";
    let handResult = 'No Hands Found';
    let result = true;

    cardsList.forEach((item) => {
        var splits = item.split("");
        if(splits.length == 2) {
            cards += splits[0];
            suits += splits[1];
        } else if (splits.length == 1) {
            cards += splits[0];
        }
    })

    const format = cards + "#" + suits;

    const hands = [
        { regex: /(AKQJ10)#(.)\2{4}.*/g , name: 'royalFlush' },                                                          // 0
        { regex: /(2345A|23456|34567|45678|56789|6789T|789JT|89JQT|9JKQT|AJKQT)#(.)\2{4}.*/g , name: 'straightFlush' },  // 1
        { regex: /(.)\1{3}.*#.*/g , name: 'fourOfAKind' },                                                             // 2
        { regex: /((.)\2{2}(.)\3{1}#.*|(.)\4{1}(.)\5{2}#.*)/g , name: 'fullHouse' },                                     // 3
        { regex: /.*#(.)\1{4}.*/g , name: 'flush' },                                                                      // 4
        { regex: /(2345A|23456|34567|45678|56789|6789T|789JT|89JQT|9JKQT|AJKQT)#.*/g , name: 'straight' },                // 5
        { regex: /(.)\1{2}.*#.*/g , name: 'threeOfAKind' },                                                            // 6
        { regex: /(.)\1{1}.*(.)\2{1}.*#.*/g , name: 'twoPair' },                                                         // 7
        { regex: /(.)\1{1}.*#.*/g , name: 'onePair' },                                                                   // 8
    ];

    hands.forEach((match) => {
        if(match.regex.test(format) && result) {
            handResult = match.name;
            result = false;
        }
    })
    return handResult;
};

const getCards = (cardsList) => {
    let cards = [];
    cardsList.forEach((item) => {
        var splits = item.split("");
        cards.push(splits[0]);
    })
    return cards;
};

module.exports = { getPairName, getCards };