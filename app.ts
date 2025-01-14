import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

class LottoService {
  customerTicket: { number: string; amount: number }[];
  drawResult: string | null;
  ticketsFile: string;

  constructor() {
    this.customerTicket = [];
    this.drawResult = null;
    this.ticketsFile = path.join(__dirname, 'tickets.json'); // File to store ticket history

    // Load previously purchased tickets from the file if it exists
    this.loadTickets();
  }

  // Load tickets from the file
  loadTickets() {
    if (fs.existsSync(this.ticketsFile)) {
      const data = fs.readFileSync(this.ticketsFile, 'utf8');
      this.customerTicket = JSON.parse(data);
    }
  }

  // Save tickets to the file
  saveTickets() {
    fs.writeFileSync(this.ticketsFile, JSON.stringify(this.customerTicket, null, 2));
  }

  // Buy a lotto ticket
  buyTicket(number: string, amount: number): string {
    if (!(number.length >= 1 && number.length <= 6 && /^[0-9]+$/.test(number))) {
      throw new Error("Ticket number must be 1 to 6 digits.");
    }
    if (amount <= 0) {
      throw new Error("Bet amount must be greater than 0.");
    }

    this.customerTicket.push({ number, amount });
    this.saveTickets(); // Save tickets after purchasing a new one
    return `Ticket purchased: ${number} for ${amount} baht.`;
  }

  // Get all purchased tickets
  getTicket(): { number: string; amount: number }[] {
    return this.customerTicket;
  }

  // Generate random numbers for buying tickets
  getRandomNumber(
    digitCount: number,
    quantity: number,
    amount: number,
    fixedDigits?: { digit: number; number: number }[]
  ): string[] {
    if (!(digitCount >= 1 && digitCount <= 6)) {
      throw new Error("Digit count must be between 1 and 6.");
    }
    if (quantity <= 0 || amount <= 0) {
      throw new Error("Quantity and amount must be greater than 0.");
    }

    const generatedNumbers: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const number: string[] = Array.from({ length: digitCount }, () => Math.floor(Math.random() * 10).toString());

      // Apply fixed digits if provided
      if (fixedDigits) {
        for (const { digit, number: fixedNumber } of fixedDigits) {
          if (digit >= 1 && digit <= digitCount) {
            number[digit - 1] = fixedNumber.toString();
          }
        }
      }

      const generatedNumber = number.join("");
      generatedNumbers.push(generatedNumber);
      this.customerTicket.push({ number: generatedNumber, amount });
    }

    this.saveTickets(); // Save tickets after generating random numbers
    return generatedNumbers;
  }

  // Set a 6-digit draw result (random or specified)
  setDraw(result?: string): string {
    if (result) {
      if (!(result.length === 6 && /^[0-9]+$/.test(result))) {
        throw new Error("Draw result must be a 6-digit number.");
      }
      this.drawResult = result;
    } else {
      this.drawResult = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString()).join("");
    }

    return this.drawResult;
  }

  // Check winning tickets and calculate the prize
  checkWinTicket(): { ticket: string; prize: number }[] {
    if (!this.drawResult) {
      throw new Error("Draw result has not been set.");
    }

    const prizes: { ticket: string; prize: number }[] = [];
    let isWinningTicket = false;

    for (const ticket of this.customerTicket) {
      const { number, amount } = ticket;
      let matchLength = 0;

      // Check how many digits match from the rightmost digits
      for (let i = 1; i <= number.length; i++) {
        if (number[number.length - i] === this.drawResult[this.drawResult.length - i]) {
          matchLength++;
        } else {
          break;
        }
      }

      // If any digits match, calculate the prize based on the number of digits matched
      if (matchLength > 0) {
        let payoutMultiplier = 0;

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

        const prize = amount * payoutMultiplier;
        prizes.push({ ticket: number, prize });
        isWinningTicket = true;
      }
    }

    if (isWinningTicket) {
      // Clear ticket history if a ticket wins
      this.customerTicket = [];
      this.saveTickets(); // Save the empty history to the file
    }

    return prizes;
  }

  // Get the draw result
  getDrawResult(): string {
    return this.drawResult ?? "No draw result yet.";
  }
}

// Create a readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const service = new LottoService();

function promptUser(message: string) {
  return new Promise<string>((resolve) => rl.question(message, resolve));
}

async function main() {
  try {
    // Get the number of tickets the user wants to buy
    const numTickets = await promptUser("Enter the number of tickets you want to buy: ");
    const ticketQuantity = parseInt(numTickets, 10);

    // Validate the input quantity
    if (isNaN(ticketQuantity) || ticketQuantity <= 0) {
      console.log("Please enter a valid number of tickets.");
      rl.close();
      return;
    }

    for (let i = 0; i < ticketQuantity; i++) {
      // Get ticket number and amount from user
      let ticketNumber = await promptUser(`Enter ticket number for ticket ${i + 1} (1 to 6 digits): `);

      // Validate the input ticket number
      if (!/^[0-9]+$/.test(ticketNumber)) {
        console.log("Please enter a valid number!!!");
        rl.close();
        return; // Stop execution if the input is invalid
      }

      const ticketAmount = await promptUser(`Enter bet amount for ticket ${i + 1}: `);

      // Buy ticket
      const message = service.buyTicket(ticketNumber, parseInt(ticketAmount, 10));
      console.log(message);
    }

    // Set draw result (You can modify this to accept your own draw result)
    const drawResult = service.setDraw(); // You can also accept a custom draw result from the user
    console.log("Draw Result:", drawResult);

    // Wait for the user to request winning tickets
    const command = await promptUser("Type 'win' to check winnings: ");
    if (command.toLowerCase() === "win") {
      const winningTickets = service.checkWinTicket();
      console.log("Winning Tickets:");

      // Show the draw result
      console.log(`Draw Result: ${service.getDrawResult()}`);

      // Filter and show only winning tickets
      let foundWinningTicket = false;
      winningTickets.forEach(winningTicket => {
        if (winningTicket.prize > 0) {
          console.log(`Ticket ${winningTicket.ticket} wins ${winningTicket.prize} baht.`);
          foundWinningTicket = true;
        }
      });

      if (!foundWinningTicket) {
        console.log("No tickets won.");
      }
    } else {
      console.log("Invalid command.");
    }

    // Now, allow the user to check their history after displaying winnings
    const historyCommand = await promptUser("Type 'history' to see your ticket history: ");
    if (historyCommand.toLowerCase() === "history") {
      const tickets = service.getTicket();
      console.log("Ticket History:");
      if (tickets.length > 0) {
        tickets.forEach(ticket => {
          console.log(`Ticket ${ticket.number} - ${ticket.amount} baht`);
        });
      } else {
        console.log("No tickets purchased yet.");
      }
    } else {
      console.log("Invalid command.");
    }

  } catch (error) {
    console.error(error.message);
  } finally {
    rl.close();
  }
}

main();
