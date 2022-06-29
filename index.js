const fs = require("fs");

// Utils
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function binToDecimal(binary) {
  return parseInt(binary, 2);
}

function arrayToDecimal(arr) {
  if (typeof arr !== "object") {
    return arr;
  }

  return parseInt(arr.join(""), 2);
}

function init() {
  let populacja = [];
  let pary = [];
  let populacjaPoKrzyzowaniu = [];
  let populacjaPoMutacji = [];
  const dlug_ciagu = 8; // dlugosc ciagu

  const wspolczynniki = {
    a: -1,
    b: 80,
    c: -1,
  };

  let ile_wyn = 40; //	liczba	uruchomień	programu
  let lb_pop = 2; // liczba	populacji
  let ile_os = 50; // liczba	osobników	w	populacji
  let pr_krzyz = 0.8; // prawdopodobieństwo	krzyżowania
  let pr_mut = 0.1; // prawdopodobieństwo	mutacji

  function fun_kwadratowa(x) {
    const { a, b, c } = wspolczynniki;
    return a * x * x + b * x + c;
  }

  function inicjalizaca_populacji(ile_os, lb_pop) {
    const populacja = [];
    for (let i = 0; i < ile_os; i++) {
      const osobnik = [];

      for (let j = 0; j < dlug_ciagu; j++) {
        osobnik.push(getRandomInt(2));
      }

      populacja.push(osobnik);
    }

    return populacja;
  }

  function losowaniePary() {
    pary = [];
    const nums = new Set();

    while (nums.size !== ile_os) {
      nums.add(Math.floor(Math.random() * ile_os));
    }

    for (let i = 0; i < ile_os; i += 2) {
      const osobnikA = populacja[[...nums][i]];
      const osobnikB = populacja[[...nums][i + 1]];

      if (osobnikA === undefined || osobnikB === undefined) {
        debugger;
      }

      pary.push([osobnikA, osobnikB]);
    }

    return pary;
  }

  function krzyzowanie_par() {
    const paryPoKrzyzowaniu = pary.map((para) => {
      if (Math.random(1) < pr_krzyz) {
        const punktPrzeciecia = Math.floor(Math.random() * 6 + 1);

        const osobnikA = [
          ...para[0].slice(0, punktPrzeciecia),
          ...para[1].slice(punktPrzeciecia, dlug_ciagu),
        ];

        const osobnikB = [
          ...para[1].slice(0, punktPrzeciecia),
          ...para[0].slice(punktPrzeciecia, dlug_ciagu),
        ];

        return [osobnikA, osobnikB];
      }

      return para;
    });

    return paryPoKrzyzowaniu;
  }

  function mutacjaOsobnikow() {
    return [...populacjaPoKrzyzowaniu].map((osobnik) => {
      return osobnik.map((gen) => {
        if (Math.random(1) < pr_mut) {
          return Number(!Boolean(gen));
        }

        return gen;
      });
    });
  }

  function selekcjaOsobnikow() {
    const wartonscMinOsobnika = znajdzMinOsobnika(populacjaPoMutacji).y;

    let prawdoPosrodPopulacji = [];
    let nowaPopulacja = [...populacjaPoMutacji];

    const sumaWartosciOsobnikow = populacjaPoMutacji.reduce(
      (prevOsobnik, currentOsobnik) => {
        return (
          prevOsobnik +
          fun_kwadratowa(arrayToDecimal(currentOsobnik)) +
          Math.abs(wartonscMinOsobnika) +
          1
        );
      },
      0
    );

    prawdoPosrodPopulacji = [...populacjaPoMutacji].map((osobnik) => {
      const wartosc =
        fun_kwadratowa(parseInt(osobnik.join(""), 2)) +
        Math.abs(wartonscMinOsobnika) +
        1;

      const prawdodobienstwo = wartosc / sumaWartosciOsobnikow;

      return {
        wartosc,
        prawdodobienstwo,
      };
    });

    nowaPopulacja.reduce((prevOsobnik, currentOsobnik, index) => {
      prawdoPosrodPopulacji[index].from = index === 0 ? 0 : prevOsobnik;
      prawdoPosrodPopulacji[index].to =
        prawdoPosrodPopulacji[index].prawdodobienstwo + prevOsobnik;

      return prawdoPosrodPopulacji[index].to;
    }, 0);

    const populacjaPoSelekcji = populacjaPoMutacji.map((osobnik) => {
      const losowaLiczba = Math.random();

      const indexOsobnikaZPrzedzialu = prawdoPosrodPopulacji.findIndex(
        (osobnikZPrawdo) => {
          if (
            osobnikZPrawdo.from <= losowaLiczba &&
            osobnikZPrawdo.to >= losowaLiczba
          ) {
            return true;
          }
        }
      );

      return populacjaPoMutacji[indexOsobnikaZPrzedzialu];
    });

    return populacjaPoSelekcji;
  }

  function znajdzMaxOsobnika(populacja) {
    let wartoscMaxOsobnika = {
      y: null,
      x: null,
    };

    populacja.forEach((osobnik) => {
      const wartoscOsobnika = fun_kwadratowa(arrayToDecimal(osobnik));

      if (
        wartoscOsobnika > wartoscMaxOsobnika.y ||
        wartoscMaxOsobnika.y === null
      ) {
        wartoscMaxOsobnika.y = wartoscOsobnika;
        wartoscMaxOsobnika.x = arrayToDecimal(osobnik);
      }
    });

    return wartoscMaxOsobnika;
  }

  function znajdzMinOsobnika(populacja) {
    let wartonscMinOsobnika = {
      y: null,
      x: null,
    };

    populacja.forEach((osobnik) => {
      const wartocOsobnika = fun_kwadratowa(arrayToDecimal(osobnik));

      if (
        wartocOsobnika < wartonscMinOsobnika.y ||
        wartonscMinOsobnika.y === null
      ) {
        wartonscMinOsobnika.y = wartocOsobnika;
        wartonscMinOsobnika.x = arrayToDecimal(osobnik);
      }
    });

    return wartonscMinOsobnika;
  }

  function simpleGenericAlgorithm(
    wspolczynniki,
    ile_wyn,
    lb_pop,
    ile_os,
    pr_krzyz,
    pr_mut
  ) {
    let logs = "";
    populacja = inicjalizaca_populacji(ile_os);
    
    for (let i = 0; i < ile_wyn; i++) {
      for (let j = 0; j < lb_pop; j++) {
        pary = losowaniePary();
        populacjaPoKrzyzowaniu = krzyzowanie_par().flat(1); // flat na zwroconych parach
        populacjaPoMutacji = mutacjaOsobnikow();
        populacja = selekcjaOsobnikow();
      }

      najwiekszyOsobnik = znajdzMaxOsobnika(populacja);

      logs += `${najwiekszyOsobnik.x} ${najwiekszyOsobnik.y}\n`;
    }

    fs.writeFileSync("results.txt", logs);
  }

  simpleGenericAlgorithm(
    wspolczynniki,
    ile_wyn,
    lb_pop,
    ile_os,
    pr_krzyz,
    pr_mut
  );
}

init();
