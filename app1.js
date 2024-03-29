/**
 * @param budgetController Budget Controller
 */
let budgetController = (function() {
	// Function constructors for Expense & Income
	// Expenses
	let Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	// Method that calculates each "Expense" object's percentage.
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = '';
		}
	};

	// This function is going to retrive the percentage from the object and then return it.
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	// Income
	let Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	// Calculates the total sum of the budget
	let calculateTotal = function(type) {
		let sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	// data-structure to recieve data and store expenses-data and income-data & totals.
	let data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	/**
	 * The (type) which is "exp" or "inc" which comes from the (addItem) method. And the IF-Else statements 
	 * determites if the (type) is and "exp" or "inc" and pushes it to it's array.
	 */
	return {
		addItem: function(type, des, val) {
			let newItem, ID;

			// Creates new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// Create new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// Push it into our data structure
			data.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		},

		// Method to delete an item for the budget controller
		deleteItem: function(type, id) {
			let ids, index;
			// If, ID = 6. Then the index of that ID is 3
			// ids = [1 2 4 6 8]
			// Index = 3

			// Create array then retrieve the index v-v
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			// Returns the index number of the element of the array that we input here(id).
			index = ids.indexOf(id);

			/** 
			 * "index" can be -1 if the item is not found in the array. 
			 *  I only want to remove something if it's different to -1
			 * 	"splice" is used to delete elements from an array.
			*/
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		/**
		 *  @param calculateBudget Calculates the total income and the total expenses, 
		 * 	and the percentage.
		 */
		calculateBudget: function() {
			// Calculate total income & expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// Calculates the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			} else {
				data.percentage = -1;
			}
		},

		// Calculates "exp" percentages
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			let allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		// Returns the budget
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		// "Testing" function to be able to look at the data object in the console.
		testing: function() {
			console.log(data);
		}
	};
})();

/**
 * @param UIController UI Controller
 */
let UIController = (function() {
	/**
	 * @param DOMstrings Data-Structure which holds all the class-names in objects.
	 */
	let DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	// Formatting numbers for better UI experience
	let formatNumber = function(num, type) {
		let numSplit, int, dec;

		// 1. + or - before the number depending on type

		// 2. Exactly 2 decimal points
		num = Math.abs(num);
		num = num.toFixed(2);
		// 3. Comma separating the thousands

		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? (sign = '-') : (sign = '+')) + ' ' + int + '.' + dec;
	};

	let NodeListForEach = function(list, callback) {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: (type = document.querySelector(DOMstrings.inputType).value), // Will be either inc or exp
				description: (description = document.querySelector(DOMstrings.inputDescription).value),
				value: parseFloat((value = document.querySelector(DOMstrings.inputValue).value))
			};
		},

		addListItem: function(obj, type) {
			let html, newHtml, element;
			// Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		// Deletes item from the UI. "el" = element
		deleteListItem: function(selectorID) {
			let el = document.getElementById(selectorID);

			el.parentNode.removeChild(el);
		},

		// Clears the input fields
		clearFields: function() {
			/**
			 *  @param fields Selects the inputDescription & inputValue. The "field" variable holds the result 
			 * 	and returns a "list".
			*/
			let fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// Returns "fields" but it's a array
			fieldsArr = Array.prototype.slice.call(fields);

			// Loops over the array and clears the all the fields that were selected.
			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			});

			fieldsArr[0].focus();
		},

		/**
		 * @param displayBudget Displays the budget, total income, 
		 * total expense and percentage on the UI. And stores the data in the "obj".
		 */
		displayBudget: function(obj) {
			obj.budget > 0 ? (type = 'inc') : (type = 'exp');

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		// Displays small percentages besides "exp".
		displayPercentages: function(percentages) {
			let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			NodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = percentages[index] + '---';
				}
			});
		},

		// Gets current month
		displayMonth: function() {
			let now, month, year, months;
			now = new Date();

			// Array for the months
			months = [
				'January',
				'Feburary',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];
			// Returns the current month & year
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		/**
		 * @param changedType Changes input fields when the "exp" is selected to red
		 */
		changedType: function() {
			let fields = document.querySelectorAll(
				DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
			);

			NodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});

			// Makes input button red
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		// Makes the (DOMstrings) object global so any controller can access it.
		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();

/**
 * @param controller We will pass the (UIController) and (BudgetController) as arguments to the (controller)
 * so the controller function knows about the other to so it can connect them both.
 */
// Global app controller
let controller = (function(budgetCtrl, UICtrl) {
	let setupEvenListeners = function() {
		let DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		// Add's item when "enter" is pressed
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		/** 
		 *  Setting a "eventListener" to the container, which is the first element 
		 *  that all of the income and expense items have in common. With this i want to do even-delegation.
		 *  Instead of adding one "eventListener" to all of the elements that i want, like exp and inc.
		 *  I can just add them to the container and let the event "bubble" up.
		*/
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	// function that updates the budget
	let updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. return the budget
		let budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	let updatePercentages = function() {
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();
		// 2. Read percentages from the budget controller
		let percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	// Add's the item to the UI
	let ctrlAddItem = function() {
		let input, newItem;

		// 1. Get the field input data
		input = UICtrl.getInput();

		/*
		* If there is data in the input fields then, this below happens. 
		* If there is no data then nothing happens
		*/
		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate and update budget
			updateBudget();

			// 6. Calculate and update percentages
			updatePercentages();
		}
	};

	// Deletes item from the UI
	let ctrlDeleteItem = function(event) {
		let itemID, splitID, type, ID;

		/** 
		 *  @param itemID I targeted the item ID from the DOM and stored the ID in the "itemID" variable.
		 * The "itemID" variable is going to be very useful, 
		 * because in "itemID" is encoded the item type, (exp or in) and the unique ID.
		*/
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		// IF itemID is defined, then we want stuff to happen
		if (itemID) {
			// Made 2 new variables that i split using .split and isolate the item "type" and "ID".
			splitID = itemID.split('-');
			type = splitID[0];
			// Converts string into a number with "parseInt"
			ID = parseInt(splitID[1]);

			// 1. Delete item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate and update percentages
			updatePercentages();
		}
	};

	// Initalization Function
	// Init function, we can put all the code that i want to be executed when the application starts.
	return {
		init: function() {
			console.log('Application has started.');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
			setupEvenListeners();
		}
	};
})(budgetController, UIController);

controller.init();
