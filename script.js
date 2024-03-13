'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// 顯示transfer紀錄 , 參數調用一個數組
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  // 實現sort 功能
  // 因為sort方法會對實際的數組發生改變 所以使用淺層拷貝
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i, arr) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>`;

    // <!-- beforebegin -->
    // <p>
    //   <!-- afterbegin -->
    //   foo
    //   <!-- beforeend -->
    // </p>
    // <!-- afterend -->
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
// displayMovements(account1.movements);

// 顯示錢的總額 餘額
const calcDisplayBalance = function (acc) {
  // 計算前的餘額 參數調用一個obj, 直接創建一個物件的屬性
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.innerHTML = `${acc.balance}€`;
};
// calcDisplayBalance(account1.movements);

// 計算 in out interest
const calcDisplaySummary = function (acc) {
  // 創建一個函數,調用obj帳戶
  // 存的
  const incomes = acc.movements
    .filter(mov => mov > 0) // 篩選值>0
    .reduce((acc, mov) => acc + mov, 0); // 疊加
  labelSumIn.innerHTML = `${incomes}€`; // 顯示ui
  // 出的
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.innerHTML = `${Math.abs(out)}€`;
  // 每次存款都要利息
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0); // 有一個值小於1
  labelSumInterest.innerHTML = `${interest}€`;
};
// calcDisplaySummary(account1.movements);
// 簡化姓名fn
// 函數導入物件數組 [account1, account2, account3, account4]
const createUsernames = function (accs) {
  // 建立登入的user name
  // 使用forEach後 回調參數是迭代元素
  accs.forEach(function (acc) {
    // 創建一個新的屬性username
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts); // console.log(accounts);
//創建一個更新UI的function
const updateUI = function (acc) {
  // display movements
  displayMovements(acc.movements);
  // display balance
  calcDisplayBalance(acc);
  // display summary
  calcDisplaySummary(acc);
};
// 登入事件
let currentAccount;
console.log(accounts);

btnLogin.addEventListener('click', function (e) {
  // 回調函數 停止事件送出預設
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  // 使用可選鏈接 , 這個pin屬性只會在這裡的當前帳戶實際存在的情況下才會被讀取
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display and message
    labelWelcome.innerHTML = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // claer input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    // remove focus
    inputLoginPin.blur();
    //調用更新UI function
    updateUI(currentAccount);
  }
});
// 實現轉帳功能
btnTransfer.addEventListener('click', function (e) {
  // 回調函數 停止事件送出預設
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);

  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  console.log(amount, receiverAcc);
  // 清除input的輸入值
  inputTransferTo.value = inputTransferAmount.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    // 這邊使用可選鏈接,如果這個對象不存在,那麼這個對象會立即變成undefined的,整個結束操作會失敗
    receiverAcc?.username !== currentAccount.username
  ) {
    // 進行金錢轉移的同時,我們還希望同時更新介面數據
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //調用更新UI function
    updateUI(currentAccount);
  }
});

// 實現貸款申請功能
btnLoan.addEventListener('click', function (e) {
  // 回調函數 停止事件送出預設
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // add movement
    currentAccount.movements.push(amount);
    console.log(`Request loan`);
    // update UI
    updateUI(currentAccount);
  }
  // 清除input value
  inputLoanAmount.value = '';
});

// 在我們的應用程序中,關閉帳戶基本上就是從帳戶數組中刪除該帳戶對象
// 結論:find和findIndex方法都可以訪問當前索引以及當前的整個數組
btnClose.addEventListener('click', function (e) {
  // 回調函數 停止事件送出預設
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // 刪除數組
    accounts.splice(index, 1);
    // 關閉UI顯示
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// 實現sort功能按鈕
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/*  1
let arr = ['a', 'b', 'c', 'd', 'e'];

// slice方法,我們可以提取任何數組的一部分,而不需要改變原始數組
console.log(arr.slice(2)); //(3) ['c', 'd', 'e']
console.log(arr.slice(2, 4)); //(2) ['c', 'd']
console.log(arr.slice(-2)); //(2) ['d', 'e']
console.log(arr.slice(-1)); //['e']
console.log(arr.slice(1, -2)); // (2) ['b', 'c']
// 最後我們可以使用slice方法簡單地創建任藝術組的淺層副本
console.log(arr.slice()); //(5) ['a', 'b', 'c', 'd', 'e']
console.log([...arr]); //(5) ['a', 'b', 'c', 'd', 'e']
// splice方法與slice方法幾乎相同,但根本的區別在於它實際上改變了原始數組
arr.splice(-1);
console.log(arr); //(4) ['a', 'b', 'c', 'd']
arr.splice(1, 2); // 第一個參數的作用和slice方法一樣,但第二個參數是我們要刪除的元素的個數
console.log(arr); //(2) ['a', 'd']
// reverse
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse()); //(5) ['f', 'g', 'h', 'i', 'j']
// 這裡需要注意的是reverse方法確實改變了原始數組
console.log(arr2); //(5) ['f', 'g', 'h', 'i', 'j']

// concat
const letters = arr.concat(arr2);
console.log(letters); //(10) ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
console.log([...arr, ...arr2]); //(10) ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
// join
console.log(letters.join(' - ')); //a - b - c - d - e - f - g - h - i - j
*/
/* 2
const arr = [23, 11, 64];
console.log(arr[0]); //23
console.log(arr.at(0)); //23
// 事實上at方法有一個特殊性,這使得它非常有用,可以用來代替括號符號
// getting last arr element
console.log(arr[arr.length - 1]); //64
console.log(arr.slice(-1)[0]); //64
console.log(arr.at(-1)); //64
// at方法也適用於字符串
console.log('jiyan'.at(0)); //j
console.log('jiyan'.at(-1)); //n
*/
/*3 
// 正值是存 負值是取
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
  }
}
console.log(`-----FOREACH-----`);
// forEach方法實際上需要一個回調函數
// 從技術上講,forEach是一個更高階的函數,正如我們在上一節課所學到的,它需要一個回調函數來告訴它該做什麼
// 這一點很重要,要記住,forEach什麼時候會調用這個回調函數
// forEach方法所做的就是循環遍歷數組,每次迭代時,它都會執行這個回調函數
// 當forEach方法在每次迭代中調用這個回廟函數時,它會將數組的當前元素作為參數傳遞,我們可以在這裡指定它,然後再調用它的移動
// forEach傳入了當前元素,索引和整個數組
movements.forEach(function (mov, i, array) {
  if (mov > 0) {
    console.log(`mov ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`mov ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
});
// 0: function(200)
// 1: function(450)
// 2: function(400)
*/
/* 
// map
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// set
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currencies);
currenciesUnique.forEach(function(value , _, map) {
  console.log(`${value}: ${value}`);
}) 
*/

// Coding Challenge #1

/*
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/* 
const checkDogs = function (dogsJulia, dogsKate) {
  const dogsJuliaCorrected = dogsJulia.slice(1, -2);

  console.log(dogsJuliaCorrected);

  const margeArr = dogsJuliaCorrected.concat(dogsKate);
  console.log(margeArr);

  margeArr.forEach(function (old, i) {
    console.log(
      `Dog number ${i + 1} is ${
        old >= 3 ? 'an adult 🐕' : 'still a puppy 🐶'
      }, and is ${old} years old`
    );
  });
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
*/
/*  
//map
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// 假設這些變動是以歐元為單位的,我們現在要將其轉換成美元
const eurToUsd = 2;
// 當我們使用Map方法會回傳一個新數組, 所以用變量儲存起來
// 這更符合函數式編程, 像這樣把方法和回調函數一起使用,是一種新的現代做事方式
const movementsUSD = movements.map(function (mov) {
  // 就像forEach方法一樣我們都需要一個回調函數
  // 這個回調函數還獲取當前數組元素作為參數
  // 這就是為什麼一旦理解了forEach方法,所有其他的方法就會變得更容易理解
  return mov * eurToUsd;
  // return 23  //回會傳23這是我們從回調函數返回的結果
});
// 轉成箭頭函式
const movementsUSDArrow = movements.map(mov => mov * eurToUsd);
console.log(movements); //(8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(movementsUSD); //(8) [400, 900, -800, 6000, -1300, -260, 140, 2600]

const movementsUSDfor = [];
for (const mov of movements) movementsUSDfor.push(mov * eurToUsd);
console.log(movementsUSDfor); //(8) [400, 900, -800, 6000, -1300, -260, 140, 2600]

// 就像forEach方法一樣,math方法也可以訪問完全相同的三個參數
const movementsDescriptions = movements.map(
  (mov, i ,arr) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
console.log(movementsDescriptions);
// 在每次迭代中,我們執行了一些操作,這些操作隨後在控制台中可見,我們可以稱之為副作用
// 因此forEach方法都會產生副作用,但是現在使用這個map方法,我們所做的只是從回調中返回每個字福串
// 基本上,它們被添加到一個新的數組中,最後我們將整個數組紀錄到控制台,而不是逐個紀錄元素
// 所以在這個map方法中我們沒有在每次迭代中產生副作用,我們所做的只是建立一個全新的數組
*/
/* 
//filter
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const deposits = movements.filter(function (mov) {
  return mov > 0;
});
console.log(movements); //(8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(deposits); //(5) [200, 450, 3000, 70, 1300]

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov);
console.log(depositsFor); //(5) [200, 450, 3000, 70, 1300]

const withdrawls = movements.filter(mov => mov < 0);
console.log(withdrawls); //(3) [-400, -650, -130]
*/
/* 
//reduce方法
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements); //(8) [200, 450, -400, 3000, -650, -130, 70, 1300]
// 此balance後續會為一個值,而不是整個數組
// 累加器就像滾雪球一樣
const balance = movements.reduce(function (acc, cur, i, arr) {
  // 累加器是我們要一直加到的值,所以我們要做的就是把當前值加到累加器上
  console.log(`Iteration ${i}: ${acc}`);
  return acc + cur;
}, 0); //設定累加器的初始值0

console.log(balance); //3840

let balance2 = 0;
for (const mov of movements) balance2 += mov;
console.log(balance2); //3840

//求最大值
const max = movements.reduce(function (acc, mov) {
  // 假設初始值 > 現在值 回傳 初始值 因為初始值較大
  if (acc > mov) return acc;
  // 假設初始值 < 現在值 回傳 現在值
  else return mov;
  // 重複這個迭代過程 直到回傳一個值出來
}, movements[0]); // 初始值為數組第一個數字200

console.log(max); //3000
*/
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/* 
const calcAverageHumanAge = function (ages) {
  // 計算狗的人類年齡
  const humanAge = ages.map(dogAge =>
    dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4
  );
  // 排除所有18歲以下的人類狗
  const adultDog = humanAge.filter(age => age > 18);

  // 計算所有成年狗的平均年齡
  // const adultDogAvg =
    // adultDog.reduce((acc, cur) => acc + cur, 0) / adultDog.length;
  // 2 3 . (2+3)/2 = 2.5   === 2/2 + 3/2 = 2.5
  const adultDogAvg = adultDog.reduce(
    (acc, cur, i, arr) => acc + cur / arr.length, 
    0
    // 0 + 36 /5  = 7.2
    // 7.2 + 32 /5 = 13.6
    // 13.6 + 76 / 5 = 28.8
    // 28.8 + 48 /5 = 38.4
    // 38.4 + 28 /5 = 44
  );

  console.log(humanAge);
  console.log(adultDog);
  return adultDogAvg;
};
const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

console.log(avg1, avg2);
*/

/* 
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// 歐元轉成美金
const eurToUsd = 1.1;
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);

console.log(totalDepositsUSD);
*/

// Coding Challenge #3

/*
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/* 
const calcAverageHumanAge = ages =>
  ages
    .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))
    .filter(age => age > 18)
    .reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

console.log(avg1, avg2);
*/

/* 
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const firstWithdrawal = movements.find(mov => mov < 0);
console.log(movements); //(8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(firstWithdrawal); //-400

console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(account);
*/
/* 
// some方法
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// 所以我們可以使用includes方法來測試數組是否包含某個值,可以得到true or false
// 等於
console.log(movements.includes(-130)); //true
// 這本質上是對等式的測驗,但是如果我們想要測試條件呢? 這就是some方法的運用之地
// 條件
console.log(movements.some(mov => mov === -130)); //true

const anyDeposits = movements.some(mov => mov > 1500);
console.log(anyDeposits); //true

// every方法
// every方法與some方法相似它們之前的差別在於
// ,every只有在數組中的所有元素都滿足我們傳入的條件時才會返回true

console.log(movements.every(mov => mov > 0)); //false
console.log(account4.movements.every(mov => mov > 0)); //true

// 到目前為止,我們一直把回調函數作為參數直接寫入數組方法中,
// 但是我們也可以單獨編寫此函數,然後將其作為回調函數傳遞

const deposit = mov => mov > 0;
console.log(movements.some(deposit)); //true
console.log(movements.every(deposit)); //false
console.log(movements.filter(deposit)); //(5) [200, 450, 3000, 70, 1300]
*/
/* 
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat()); //(8) [1, 2, 3, 4, 5, 6, 7, 8]
const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat(2)); // 展開幾層 預設1層 //(8) [1, 2, 3, 4, 5, 6, 7, 8]
// 假設銀行本身要計算所有帳戶的所有變動的總餘額
// 首先我們把所有的變動都存儲在數組中
// 這些arr在accounts數組的對象裡面
// flat
const overalBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance); //17840
// 由此可知 首先使用map然後將結果flat展平,這是一個非常常見的操作
// 另一種解法 flatmap 本質上將一個map和flat方法組合成一個方法 ,這對性能更好

// flatMap
const overalBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance2); //17840
// 注意 flatMap只能深入一層,我們不能改變他
*/
/* 
// sort srting
const owner = ['Jiyan', 'Yunni', 'Anny', 'Zac'];
console.log(owner.sort()); // 會改編原來數組 //(4) ['Anny', 'Jiyan', 'Yunni', 'Zac']
console.log(owner); // (4) ['Anny', 'Jiyan', 'Yunni', 'Zac']

// Numbers
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements); //(8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(movements.sort()); //(8) [-130, -400, -650, 1300, 200, 3000, 450, 70] // sort方法是按造字符串進行排序的

// if return < 0 , a , b (keep order)
// if return > 0 , b , a (switch order)
// 我們把a和b看作數組中的兩個連續的數字
// movements.sort((a, b) => {
//   // 升
//   if (a > b) return 1;
//   if (a < b) return -1;
//   // 已經知道a如果大於b,那麼a減b總是正數
//   // 已經知道a如果小於b,那麼a減b總是負數
// });
movements.sort((a, b) => a - b);
console.log(movements); //(8) [-650, -400, -130, 70, 200, 450, 1300, 3000]

// movements.sort((a, b) => {
//   // 降
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
console.log(movements); //(8) [3000, 1300, 450, 200, 70, -130, -400, -650]
*/
/* 
const arr = [1, 2, 3, 4, 5, 6, 7];
console.log(new Array(1, 2, 3, 4, 5, 6, 7));
//我們實際上可以通過編程方式生成數組,最簡單的方法是使用array()構造函數

// Array()的奇怪行為,當我們參數只傳入一個時,它就會創建一個新的空參數,長度為該長度
// 因此如果我們不知道array()構造函數的這種特殊性,那麼可能會得到奇怪的錯誤
// emprty arrays + fill method
const x = new Array(7);
console.log(x); //(7) [empty × 7]
console.log(x.map(() => 5)); //(7) [empty × 7]

// 這個方法實際上有點像slice()方法
x.fill(1, 3, 5);
console.log(x); //(7) [empty × 3, 1, 1, empty × 2]

arr.fill(23, 2, 6);
console.log(arr); //(7) [1, 2, 23, 23, 23, 23, 7]

// Array.from
// 這實際上是一種全新的東西,所以這裡我們不使用arr.form作為數組的方法
// 相反我們在array()構造函數上使用它
const y = Array.from({ length: 7 }, () => 1); // Array這裡是一個函數,然後在這個函數對象上,我們調用from()方法
console.log(y); //(7) [1, 1, 1, 1, 1, 1, 1]

const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z); //(7) [1, 2, 3, 4, 5, 6, 7]

// 創建一個包含10個隨機擲骰子的數組
const h = Array.from({ length: 10 }, function (_, i) {
  return Math.trunc(Math.random() * 6) + 1;
});
console.log(h);

// from()函數最初引入javaScript是為了從類似數組的結構中創建數組
// 這邊我們使用了Array.from()從querySelectorAll()的結果創建一個數組
// 該數組是一個NodeList,它實際上並不是一個數組,而是一個類似數組的結構
// 而該類似數組的結構可以使用Array輕鬆地轉換為數組
labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
    // 第二步我們甚至包括了map函數,它將初始數組完全按造我們的要求形成數組
    // 因此基本上將原始數組換換為它的文本內容
  );
  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
});
*/

/* 
// 計算銀行裡總共存了多少錢
// const bankDepositSum = accounts.map(acc => acc.movements).flat();
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);
console.log(bankDepositSum);

// 計算有多少至少1000美
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;
const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

console.log(numDeposits1000);

// prefixed ++ oeprator
let a = 10;
console.log(a++); // 10
// 為什麼a實際是10而不是11??
// 實際上加號運算符確實會增加值,但它扔然會返回前一個值
// 所以如果我們現在在這裡記錄一次a,你會看到她現在確實是11
console.log(a); //11

// 練習3, 更高級的reduce方法, 在這個例子中我們要做的就是創建一個新的對象而不是一個數字或者字符串
// 所以我們已經知道reduce將一個數組歸結為一個值,所以這個值很有可能是一個對象
// 甚至可能是一個新的陣法

const { deposits, withdrawls } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawls += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawls'] += cur;
      return sums;
    },
    { deposits: 0, withdrawls: 0 }
  ); // 創建空obj

console.log(deposits, withdrawls);

// 創建一個簡單的函數,將任何字符串轉換為標題大小寫
// this is a nice title => This Is a Nice Title
const converTitleCase = function (title) {
  // 第一個字大寫
  const capitzalize = str => str[0].toUpperCase() + str.slice(1);

  // 順帶一提創建一個異常arr,然後在以後的計算中使用他,這是一種常見的模式
  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitzalize(word)))
    .join(' ');


  // 第一個字大寫
  return capitzalize(titleCase); 
};
console.log(converTitleCase('this is a nice title'));
console.log(converTitleCase('this is a LONG title but not too long'));
console.log(converTitleCase('and here is another title with an EXAMPLE'));
*/

// Coding Challenge #4

/*
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
{ weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
{ weight: 8, curFood: 200, owners: ['Matilda'] },
{ weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
{ weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/

/* 
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1
dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));
console.log(dogs); //0: {weight: 22, curFood: 250, owners: Array(2), recFood: 284}1: {weight: 8, curFood: 200, owners: Array(1), recFood: 133}2: {weight: 13, curFood: 275, owners: Array(2), recFood: 191}3: {weight: 32, curFood: 340, owners: Array(1), recFood: 376}length: 4[[Prototype]]: Array(0)

// 2
const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(dogSarah); //{weight: 13, curFood: 275, owners: Array(2), recFood: 191}
console.log(
  `Sarah's dog is eating too ${
    dogSarah.curFood > dogSarah.recFood ? 'much' : 'little'
  }.`
);

// 3
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooMuch); //(3) ['Matilda', 'Sarah', 'John']

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle); //(3) ['Alice', 'Bob', 'Michael']

// 4
// "Matilda and Alice and Bob's dogs eat too much!"
// "Sarah and John and Michael's dogs eat too little!"

console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`); //Matilda and Sarah and John's dogs eat too much!
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`); //Alice and Bob and Michael's dogs eat too little!

// 5
console.log(dogs.some(dog => dog.curFood === dog.recFood)); //false

// 6  current > (recommended * 0.90) && current < (recommended * 1.10)

const checkEatingOkay = dog =>
  dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;

console.log(dogs.some(checkEatingOkay)); //true

// 7.
console.log(dogs.filter(checkEatingOkay)); //[{…}]

// 8
// sort it by recommended food portion in an ascending order
const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(dogsSorted);
*/