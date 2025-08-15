function analyzeData() {
    const inputText = document.getElementById("inputData").value.trim();
    if (!inputText) {
        alert("Please enter some data!");
        return;
    }

    const expenses = parseExpenses(inputText);
    const stats = generateStatistics(expenses);
    displayStatistics(stats);
}

function parseExpenses(inputText) {
    const expensePattern = /(\d+(?:\.\d{1,2})?)\s*-\s*([A-Za-z\s]+)\s*\(\s*(\d{2}\/\d{2}\/\d{2})\s*\);
    const expenses = [];
    let match;

    while (match = expensePattern.exec(inputText)) {
        const amount = parseFloat(match[1]);
        const label = match[2].trim();
        const date = match[3].split('/');

        expenses.push({
            amount: amount,
            label: label,
            day: parseInt(date[0]),
            month: parseInt(date[1]),
            year: 2000 + parseInt(date[2]) // Assuming year in 20yy format
        });
    }

    return expenses;
}

function generateStatistics(expenses) {
    const monthlyStats = {};
    const yearlyStats = {};
    const labelStats = {};
    const allExpenses = [];

    expenses.forEach(expense => {
        const { amount, label, month, year } = expense;

        // Collecting all expenses for total calculations
        allExpenses.push(amount);

        // Monthly Stats
        const monthKey = `${year}-${month}`;
        monthlyStats[monthKey] = monthlyStats[monthKey] || [];
        monthlyStats[monthKey].push(amount);

        // Yearly Stats
        yearlyStats[year] = yearlyStats[year] || [];
        yearlyStats[year].push(amount);

        // Label Stats
        labelStats[label] = labelStats[label] || [];
        labelStats[label].push(amount);
    });

    // Process the statistics
    return {
        totalExpenses: allExpenses.reduce((a, b) => a + b, 0),
        averageMonthlyExpense: calculateAverage(allExpenses),
        monthlyStats: processStats(monthlyStats),
        yearlyStats: processStats(yearlyStats),
        labelStats: processLabelStats(labelStats),
        labelAverages: calculateLabelAverages(labelStats),
        highestExpenseLabel: findHighestExpenseLabel(labelStats),
        monthlyGrowth: calculateMonthlyGrowth(monthlyStats)
    };
}

function processStats(stats) {
    const processed = {};
    for (const key in stats) {
        const values = stats[key];
        processed[key] = {
            sum: values.reduce((a, b) => a + b, 0),
            max: Math.max(...values),
            min: Math.min(...values)
        };
    }
    return processed;
}

function processLabelStats(labelStats) {
    const processed = {};
    for (const label in labelStats) {
        const values = labelStats[label];
        processed[label] = {
            sum: values.reduce((a, b) => a + b, 0),
            max: Math.max(...values),
            min: Math.min(...values)
        };
    }
    return processed;
}

function calculateAverage(expenses) {
    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    return avg.toFixed(2); // Round to 2 decimal places
}

function calculateLabelAverages(labelStats) {
    const averages = {};
    for (const label in labelStats) {
        const values = labelStats[label];
        averages[label] = calculateAverage(values);
    }
    return averages;
}

function findHighestExpenseLabel(labelStats) {
    let highestLabel = '';
    let highestAmount = 0;
    for (const label in labelStats) {
        const sum = labelStats[label].reduce((a, b) => a + b, 0);
        if (sum > highestAmount) {
            highestAmount = sum;
            highestLabel = label;
        }
    }
    return highestLabel;
}

function calculateMonthlyGrowth(monthlyStats) {
    const growth = {};
    const months = Object.keys(monthlyStats).sort();
    
    for (let i = 1; i < months.length; i++) {
        const previousMonth = months[i - 1];
        const currentMonth = months[i];
        
        const previousMonthSum = monthlyStats[previousMonth].reduce((a, b) => a + b, 0);
        const currentMonthSum = monthlyStats[currentMonth].reduce((a, b) => a + b, 0);
        
        growth[currentMonth] = ((currentMonthSum - previousMonthSum) / previousMonthSum) * 100; // percentage change
    }

    return growth;
}

function displayStatistics(stats) {
    const output = document.getElementById("output");
    
    // Monthly Statistics Table
    let monthlyHTML = "<h2>Monthly Statistics</h2><table><tr><th>Month</th><th>Sum</th><th>Max</th><th>Min</th></tr>";
    for (const month in stats.monthlyStats) {
        const { sum, max, min } = stats.monthlyStats[month];
        monthlyHTML += `<tr><td>${month}</td><td>${sum}</td><td>${max}</td><td>${min}</td></tr>`;
    }
    monthlyHTML += "</table>";

    // Yearly Statistics Table
    let yearlyHTML = "<h2>Yearly Statistics</h2><table><tr><th>Year</th><th>Sum</th><th>Max</th><th>Min</th></tr>";
    for (const year in stats.yearlyStats) {
        const { sum, max, min } = stats.yearlyStats[year];
        yearlyHTML += `<tr><td>${year}</td><td>${sum}</td><td>${max}</td><td>${min}</td></tr>`;
    }
    yearlyHTML += "</table>";

    // Label-wise Statistics Table
    let labelHTML = "<h2>Label-wise Statistics</h2><table><tr><th>Label</th><th>Sum</th><th>Max</th><th>Min</th><th>Average</th></tr>";
    for (const label in stats.labelStats) {
        const { sum, max, min } = stats.labelStats[label];
        const average = stats.labelAverages[label];
        labelHTML += `<tr><td>${label}</td><td>${sum}</td><td>${max}</td><td>${min}</td><td>${average}</td></tr>`;
    }
    labelHTML += "</table>";

    // Additional Insights
    let insightsHTML = `<h2>Insights</h2>
                        <ul>
                            <li><strong>Total Expenses:</strong> ${stats.totalExpenses}</li>
                            <li><strong>Average Monthly Expense:</strong> ${stats.averageMonthlyExpense}</li>
                            <li><strong>Highest Expense Label:</strong> ${stats.highestExpenseLabel}</li>
                        </ul>`;
    
    // Monthly Growth Chart (Optional - just to show percentage increase)
    let growthHTML = "<h2>Monthly Expense Growth (%)</h2><table><tr><th>Month</th><th>Growth (%)</th></tr>";
    for (const month in stats.monthlyGrowth) {
        growthHTML += `<tr><td>${month}</td><td>${stats.monthlyGrowth[month].toFixed(2)}%</td></tr>`;
    }
    growthHTML += "</table>";

    // Update the output container
    output.innerHTML = `${monthlyHTML}${yearlyHTML}${labelHTML}${insightsHTML}${growthHTML}`;
}

// Add event listener for Ctrl + Enter keypress
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "Enter") {
        analyzeData();
    }
});
