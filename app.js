"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline");
var fs = require("fs");
var path = require("path");
var LottoService = /** @class */ (function () {
    function LottoService() {
        this.customerTicket = [];
        this.drawResult = null;
        this.ticketsFile = path.join(__dirname, 'tickets.json'); // File to store ticket history
        // Load previously purchased tickets from the file if it exists
        this.loadTickets();
    }
    // Load tickets from the file
    LottoService.prototype.loadTickets = function () {
        if (fs.existsSync(this.ticketsFile)) {
            var data = fs.readFileSync(this.ticketsFile, 'utf8');
            this.customerTicket = JSON.parse(data);
        }
    };
    // Save tickets to the file
    LottoService.prototype.saveTickets = function () {
        fs.writeFileSync(this.ticketsFile, JSON.stringify(this.customerTicket, null, 2));
    };
    // Buy a lotto ticket
    LottoService.prototype.buyTicket = function (number, amount) {
        if (!(number.length >= 1 && number.length <= 6 && /^[0-9]+$/.test(number))) {
            throw new Error("Ticket number must be 1 to 6 digits.");
        }
        if (amount <= 0) {
            throw new Error("Bet amount must be greater than 0.");
        }
        this.customerTicket.push({ number: number, amount: amount });
        this.saveTickets(); // Save tickets after purchasing a new one
        return "Ticket purchased: ".concat(number, " for ").concat(amount, " baht.");
    };
    // Get all purchased tickets
    LottoService.prototype.getTicket = function () {
        return this.customerTicket;
    };
    // Generate random numbers for buying tickets
    LottoService.prototype.getRandomNumber = function (digitCount, quantity, amount, fixedDigits) {
        if (!(digitCount >= 1 && digitCount <= 6)) {
            throw new Error("Digit count must be between 1 and 6.");
        }
        if (quantity <= 0 || amount <= 0) {
            throw new Error("Quantity and amount must be greater than 0.");
        }
        var generatedNumbers = [];
        for (var i = 0; i < quantity; i++) {
            var number = Array.from({ length: digitCount }, function () { return Math.floor(Math.random() * 10).toString(); });
            // Apply fixed digits if provided
            if (fixedDigits) {
                for (var _i = 0, fixedDigits_1 = fixedDigits; _i < fixedDigits_1.length; _i++) {
                    var _a = fixedDigits_1[_i], digit = _a.digit, fixedNumber = _a.number;
                    if (digit >= 1 && digit <= digitCount) {
                        number[digit - 1] = fixedNumber.toString();
                    }
                }
            }
            var generatedNumber = number.join("");
            generatedNumbers.push(generatedNumber);
            this.customerTicket.push({ number: generatedNumber, amount: amount });
        }
        this.saveTickets(); // Save tickets after generating random numbers
        return generatedNumbers;
    };
    // Set a 6-digit draw result (random or specified)
    LottoService.prototype.setDraw = function (result) {
        if (result) {
            if (!(result.length === 6 && /^[0-9]+$/.test(result))) {
                throw new Error("Draw result must be a 6-digit number.");
            }
            this.drawResult = result;
        }
        else {
            this.drawResult = Array.from({ length: 6 }, function () { return Math.floor(Math.random() * 10).toString(); }).join("");
        }
        return this.drawResult;
    };
    // Check winning tickets and calculate the prize
    LottoService.prototype.checkWinTicket = function () {
        if (!this.drawResult) {
            throw new Error("Draw result has not been set.");
        }
        var prizes = [];
        var isWinningTicket = false;
        for (var _i = 0, _a = this.customerTicket; _i < _a.length; _i++) {
            var ticket = _a[_i];
            var number = ticket.number, amount = ticket.amount;
            var matchLength = 0;
            // Check how many digits match from the rightmost digits
            for (var i = 1; i <= number.length; i++) {
                if (number[number.length - i] === this.drawResult[this.drawResult.length - i]) {
                    matchLength++;
                }
                else {
                    break;
                }
            }
            // If any digits match, calculate the prize based on the number of digits matched
            if (matchLength > 0) {
                var payoutMultiplier = 0;
                switch (matchLength) {
                    case 1:
                        payoutMultiplier = 10;
                        break;
                    case 2:
                        payoutMultiplier = 100;
                        break;
                    case 3:
                        payoutMultiplier = 1000;
                        break;
                    case 4:
                        payoutMultiplier = 10000;
                        break;
                    case 5:
                        payoutMultiplier = 100000;
                        break;
                    case 6:
                        payoutMultiplier = 1000000;
                        break;
                    default:
                        payoutMultiplier = 0;
                }
                var prize = amount * payoutMultiplier;
                prizes.push({ ticket: number, prize: prize });
                isWinningTicket = true;
            }
        }
        if (isWinningTicket) {
            // Clear ticket history if a ticket wins
            this.customerTicket = [];
            this.saveTickets(); // Save the empty history to the file
        }
        return prizes;
    };
    // Get the draw result
    LottoService.prototype.getDrawResult = function () {
        var _a;
        return (_a = this.drawResult) !== null && _a !== void 0 ? _a : "No draw result yet.";
    };
    return LottoService;
}());
// Create a readline interface for interactive input
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var service = new LottoService();
function promptUser(message) {
    return new Promise(function (resolve) { return rl.question(message, resolve); });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var numTickets, ticketQuantity, i, ticketNumber, ticketAmount, message, drawResult, command, winningTickets, foundWinningTicket_1, historyCommand, tickets, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, 10, 11]);
                    return [4 /*yield*/, promptUser("Enter the number of tickets you want to buy: ")];
                case 1:
                    numTickets = _a.sent();
                    ticketQuantity = parseInt(numTickets, 10);
                    // Validate the input quantity
                    if (isNaN(ticketQuantity) || ticketQuantity <= 0) {
                        console.log("Please enter a valid number of tickets.");
                        rl.close();
                        return [2 /*return*/];
                    }
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < ticketQuantity)) return [3 /*break*/, 6];
                    return [4 /*yield*/, promptUser("Enter ticket number for ticket ".concat(i + 1, " (1 to 6 digits): "))];
                case 3:
                    ticketNumber = _a.sent();
                    // Validate the input ticket number
                    if (!/^[0-9]+$/.test(ticketNumber)) {
                        console.log("Please enter a valid number!!!");
                        rl.close();
                        return [2 /*return*/]; // Stop execution if the input is invalid
                    }
                    return [4 /*yield*/, promptUser("Enter bet amount for ticket ".concat(i + 1, ": "))];
                case 4:
                    ticketAmount = _a.sent();
                    message = service.buyTicket(ticketNumber, parseInt(ticketAmount, 10));
                    console.log(message);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6:
                    drawResult = service.setDraw();
                    console.log("Draw Result:", drawResult);
                    return [4 /*yield*/, promptUser("Type 'win' to check winnings: ")];
                case 7:
                    command = _a.sent();
                    if (command.toLowerCase() === "win") {
                        winningTickets = service.checkWinTicket();
                        console.log("Winning Tickets:");
                        // Show the draw result
                        console.log("Draw Result: ".concat(service.getDrawResult()));
                        foundWinningTicket_1 = false;
                        winningTickets.forEach(function (winningTicket) {
                            if (winningTicket.prize > 0) {
                                console.log("Ticket ".concat(winningTicket.ticket, " wins ").concat(winningTicket.prize, " baht."));
                                foundWinningTicket_1 = true;
                            }
                        });
                        if (!foundWinningTicket_1) {
                            console.log("No tickets won.");
                        }
                    }
                    else {
                        console.log("Invalid command.");
                    }
                    return [4 /*yield*/, promptUser("Type 'history' to see your ticket history: ")];
                case 8:
                    historyCommand = _a.sent();
                    if (historyCommand.toLowerCase() === "history") {
                        tickets = service.getTicket();
                        console.log("Ticket History:");
                        if (tickets.length > 0) {
                            tickets.forEach(function (ticket) {
                                console.log("Ticket ".concat(ticket.number, " - ").concat(ticket.amount, " baht"));
                            });
                        }
                        else {
                            console.log("No tickets purchased yet.");
                        }
                    }
                    else {
                        console.log("Invalid command.");
                    }
                    return [3 /*break*/, 11];
                case 9:
                    error_1 = _a.sent();
                    console.error(error_1.message);
                    return [3 /*break*/, 11];
                case 10:
                    rl.close();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main();
