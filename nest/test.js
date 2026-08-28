function creerMultiplicateur(facteur) {
  console.log('création du multiplicateur, facteur =', facteur)

  return function multiplier(valeur) {
    console.log('calcul :', valeur, '*', facteur)
    return valeur * facteur
  }
}

console.log('début')
const doubler = creerMultiplicateur(2)
console.log('multiplicateur créé, pas encore utilisé')
const resultat1 = doubler(5)
console.log('résultat1 =', resultat1)
const resultat2 = doubler(10)
console.log('résultat2 =', resultat2)
console.log('fin')
