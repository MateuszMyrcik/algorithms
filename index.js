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
  let populacjaPoKrzyzowaniu = [];
  let pary = [];
  let paryPoKrzyzowaniu = [];
  let populacjaPoMutacji = [];
  const dlug_ciagu = 8; // dlugosc ciagu

  const wspolczynniki = {
    a: -1,
    b: 2,
    c: 7,
  };

  let ile_wyn = 40; //	liczba	uruchomień	programu
  let lb_pop = 100; // liczba	populacji
  let ile_os = 100; // liczba	osobników	w	populacji
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

      // const string_osobnik = osobnik.join("");
      populacja.push(osobnik);
      // populacja.push(parseInt(osobnik.join(""), 2));
    }

    return populacja;
  }

  function losowaniePary() {
    const tymczasowaPopulacja = [...populacja];

    for (let i = 0; i < ile_os / 2; i++) {
      let osobnikA = tymczasowaPopulacja.splice(
        Math.random(tymczasowaPopulacja.length),
        1
      )[0];

      let osobnikB = tymczasowaPopulacja.splice(
        Math.random(tymczasowaPopulacja.length),
        1
      )[0];

      pary.push([osobnikA, osobnikB]);
    }

    // console.log("pary", pary);
    // console.log("populacja", populacja);

    // TODO: verify pars

    return pary;
  }

  function krzyzowanie_par() {
    const paryPoKrzyzowaniu = pary.map((para) => {
      if (Math.random(1) < pr_krzyz) {
        const punktPrzeciecia = Math.floor(Math.random() * 6 + 1);
        // console.log("para przed krzyzowaniem", para);
        // console.log("punktPrzeciecia", punktPrzeciecia);

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
    const wartonscMinOsobnika = znajdzMinOsobnika().y;
    let prawdoPosrodPopulacji = [];
    let nowaPopulacja = [...populacjaPoMutacji];

    const sumaWartosciOsobnikow = populacjaPoMutacji.reduce(
      (prevOsobnik, currentOsobnik) => {
        return (
          prevOsobnik + fun_kwadratowa(parseInt(currentOsobnik.join(""), 2))
        );
      },
      0
    );

    prawdoPosrodPopulacji = [...populacjaPoMutacji].map((osobnik) => {
      return {
        wartosc:
          fun_kwadratowa(parseInt(osobnik.join(""), 2)) +
          wartonscMinOsobnika +
          1,
        prawdodobienstwo:
          (fun_kwadratowa(parseInt(osobnik.join(""), 2)) +
            wartonscMinOsobnika +
            1) /
          sumaWartosciOsobnikow,
      };
    });

    nowaPopulacja.reduce((prevOsobnik, currentOsobnik, index) => {
      prawdoPosrodPopulacji[index].from = index === 0 ? 0 : prevOsobnik;
      prawdoPosrodPopulacji[index].to =
        prawdoPosrodPopulacji[index].prawdodobienstwo + prevOsobnik;

      return prawdoPosrodPopulacji[index].to;
    }, 0);

    // console.log("populacjaPoMutacji", populacjaPoMutacji);

    const populacjaPoSelekcji = populacjaPoMutacji.map((osobnik) => {
      const losowaLiczba = Math.random();
      const indexOsobnikaZPrzedzialu = prawdoPosrodPopulacji.findIndex(
        (osobnikZPrawdo, indexPrawdo) => {
          if (
            osobnikZPrawdo.from < losowaLiczba &&
            osobnikZPrawdo.to > losowaLiczba
          ) {
            return indexPrawdo;
          }
        }
      );

      return populacjaPoMutacji[indexOsobnikaZPrzedzialu];
    });

    return populacjaPoSelekcji;

    // console.log("populacjaPoSelekcji", populacjaPoSelekcji);
  }

  function znajdzMaxOsobnika() {
    let wartoscMaxOsobnika = {
      y: null,
      x: null,
    };

    // console.log(populacja);

    populacja.forEach((osobnik) => {
      const wartocOsobnika = fun_kwadratowa(arrayToDecimal(osobnik));

      if (
        wartocOsobnika > wartoscMaxOsobnika.y ||
        wartoscMaxOsobnika.y === null
      ) {
        wartoscMaxOsobnika.y = wartocOsobnika;
        wartoscMaxOsobnika.x = arrayToDecimal(osobnik);
      }
    });

    return wartoscMaxOsobnika;
  }

  function znajdzMinOsobnika() {
    let wartonscMinOsobnika = {
      y: null,
      x: null,
    };

    // console.log(populacja);

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
    for (let i = 0; i < ile_wyn; i++) {
      populacja = inicjalizaca_populacji(ile_os);
      pary = losowaniePary();
      populacjaPoKrzyzowaniu = krzyzowanie_par().flat(1); // flat na zwroconych parach
      populacjaPoMutacji = mutacjaOsobnikow();
      populacja = selekcjaOsobnikow();
      najwiekszyOsobnik = znajdzMaxOsobnika();

      console.log(
        `Najwiekszy osobnik w pokoleniu ${i}, f(${najwiekszyOsobnik.x}) = ${najwiekszyOsobnik.y} `
      );
    }
    // console.log("paryPoKrzyzowaniu", paryPoKrzyzowaniu);
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
