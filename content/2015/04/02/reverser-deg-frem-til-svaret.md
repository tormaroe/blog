---
title: "Reverser deg frem til svaret"
layout: post
link: http://blog.kjempekjekt.com/2015/04/02/reverser-deg-frem-til-svaret/
date: 2015-04-02T21:22:08.659Z
tags:
  - Lisp
  - Scheme
  - C#
  - Spill
---
![Play a Game?](http://blog.kjempekjekt.com/uploads/2015/04/play-a-game.png)

Når du er ferdig å lese dennne artikkelen vil vi ha implementert et enkelt spill i to forskjellige språk. Du kan allerede C#, Java eller et annet språk med syntaks inspirert av C. Basert på den kunnskapen vil du nå lære lisp. Jeg vil nemlig implementere spillet samtidig i C# og Racket (en lisp), og det vil gi deg gode muligheter til å sammenligne. 

Underveis har vi det gøy.

## 1. Vi trenger en liste

Til dette spillet trenger vi en liste med tall. C# har en generisk kolleksjon som heter `List<T>` (i navnerommet `System.Collections.Generic`), så den kan vi jo bruke. La oss oppfriske hvordan vi lager to lister; en tom og en med noen tall: 

    var a = new List<int>();
    var b = new List<int> { 1, 2, 3, 4, 5 };

I Lisp-språkene er lister en fundamental datastruktur (Lisp står for *List Processing*). Jeg definerer `a` og `b` i Racket sånn som dette:

    (define a (list))
    (define b (list 1 2 3 4 5))

Enkelt, ikke sant? Alternativt kan jeg bruke noe som heter `quote`, som gjør det enda enklere:

    (define a '())
    (define b '(1 2 3 4 5))

## 2. Reversere en liste

Hvis vi har en liste, hvordan kan vi reversere den? Listen i C# er et objekt som har metoden vi trenger. Den lar oss også reversere kun en del av listen, om det er det vi ønsker:

    b.Reverse();
    // b er nå { 5, 4, 3, 2, 1 }
    
    b.Reverse(index: 0, count: 3);
    // b er nå { 3, 4, 5, 2, 1 }

I Racket har vi en funksjon som heter `reverse`. Merk at den ikke endrer listen direkte - som i C# - men i stedet returnerer en ny liste. Om vi ønsker å reversere `b` må vi *sette* den til den nye verdien:

    (set! b (reverse b))

`set!` har et utropstegn for å indikere at dette er en funksjon som muterer data (en "farlig" funksjon).

Men hvordan kan vi nå reversere kun en del av `b`? Såvidt jeg vet har ikke Racket noe ferdiglaget for dette, så nå må vi tenke litt. Racket har to funksjoner jeg kan bruke til å plukke ut en del av en liste: `take` plukker ut x elementer fra starten av en liste, mens `drop` dropper x elementer fra en liste og returnerer resten:

    (take '(1 2 3 4) 2)
    ; returnerer '(1 2)

    (drop '(1 2 3 4) 2)
    ; returnerer '(3 4)

![The Slicer](http://blog.kjempekjekt.com/uploads/2015/04/the-slicer.png)

Ved å kombinere take og drop kan vi lage en ny funksjon vi kaller `slice` som returnerer en del av en liste gitt en startindeks og et antall elementer:

    (define (slice list index count)
      (take (drop list index) count))

    (slice '(1 2 3 4 5 6 7) 2 3)
    ; returnerer '(3 4 5)

Og så kan vi bruke `slice` til å lage en `reverse-slice`. Funksjonen bygger opp en ny liste av tre deler: det som kommer før det som reverseres, det som reverseres, og det som kommer etter det som reverseres:

    (define (reverse-slice list index count)
      (append (slice list 0 index)
              (reverse (slice list index count))
              (slice list 
                     (+ index 
                        count) 
                     (- (length list) 
                        index 
                        count))))
    
    (reverse-slice '(1 2 3 4 5 6 7) 2 3)
    ; returnerer '(1 2 5 4 3 6 7)

    (set! b (reverse-slice b 0 3))
    ; b er nå '(3 4 5 2 1)

Jeg må innrømme at dette var ganske mye mere komplisert enn å bruke den ferdiglagde metoden i C#. Men sånn er det av og til :)

## 3. En tilfeldig sortering

I dette spillet vi skal lage trenger vi en liste med alle tall fra 1 til og med 9. Men hver gang vi spiller skal rekkefølgen på tallene være tilfeldig. La oss lage en funksjon for å gi oss en ny liste. Først C#:

    static List<int> NewGameList()
    {
        return Enumerable
            .Range(1, 9)
            .OrderBy( _ => Guid.NewGuid() )
            .ToList();
    }

    var game = NewGameList();
    // gir f.eks. listen { 3, 4, 1, 5, 9, 2, 8, 6, 7 }

Ok, så hvordan ser dette ut i Racket?

    (define (new-game-list)
      (shuffle (range 1 10)))

    (define game (new-game-list))
    ; gir f.eks. '(3 4 1 5 9 2 8 6 7)

## 4. Be om et tall

La oss glemme lister for en liten stund. Spillet vi skal lage trenger å be brukeren om et tall mellom 0 og 9. I C# kan vi definere en metode `PromptChoice` som sikrer at vi får et gyldig valg:

    static int PromptChoice()
    {
        while (true)
        {
            Console.Write("Hom many shall I reverse? ");
            int result;
            if (int.TryParse(Console.ReadLine(), out result)
                && result >= 0 && result < 10)
            {
                return result;
            }
            Console.WriteLine("Please answer between 0 and 9!");
        }
    }

Det var kanskje en grei måte å gjøre det på i C#. Men hva om vi dropper løkken og bruker rekursjon i stedet; personlig liker jeg det bedre:

    static int PromptChoice()
    {
        Console.Write("Hom many shall I reverse? ");
        int result;
        if (int.TryParse(Console.ReadLine(), out result)
            && result >= 0 && result < 10)
        {
            return result;
        }
        Console.WriteLine("Please answer between 0 and 9!");
        return PromptChoice();
    }

Og sånn som dette ser det ut oversatt til Racket:

    (define (prompt-choice)
      (display "How many shall I reverse? ")
      (let ([input (read)])
        (if (and (integer? input)
                 (>= input 0)
                 (< input 10))
            input
            (begin
              (displayln "Please answer between 0 and 9!")
              (prompt-choice)))))

Synes du denne var vanskelig å forstå kan du ta en titt på dokumentasjonen til [`let`](http://docs.racket-lang.org/reference/let.html?q=shuffle#%28form._%28%28lib._racket%2Fprivate%2Fletstx-scheme..rkt%29._let%29%29), [`if`](http://docs.racket-lang.org/reference/if.html?q=shuffle#%28form._%28%28quote._~23~25kernel%29._if%29%29) og [`begin`](http://docs.racket-lang.org/reference/begin.html?q=shuffle#%28form._%28%28quote._~23~25kernel%29._begin%29%29) før du leser videre.

## 5. Er listen sortert nå?

Målet med spillet er å sortere listen med tall. Derfor trenger vi en enkel funksjon som tester om målet er nådd. Jeg kaller den rett og slett `Done`:

    static bool Done(List<int> list)
    {   
        for (int i = 0; i < list.Count; i++)
            if (list[i] != i + 1) 
                return false;       
        return list.Count == 9;
    }

Det er egentlig greit å anta at listen har lengde 9, men jeg tester det på slutten likevel. Racket-utgaven av denne testen blir mye enklere, fordi jeg der kan sammenligne lister direkte:

    (define (done? list)
      (equal? list '(1 2 3 4 5 6 7 8 9))) 

Alternativt kan jeg ta på meg *fancy pants* og gjøre det på denne måten (se [Curry-oppskrift for sultne utviklere](http://blog.kjempekjekt.com/2010/08/11/curry-oppskrift-for-sultne-utviklere/)):

    (define done? 
      ((curry equal?) '(1 2 3 4 5 6 7 8 9)))

Dette er en form av [tacit programming](http://en.wikipedia.org/wiki/Tacit_programming):

> Tacit programming, also called **point-free style**, is a programming paradigm in which function definitions do not identify the arguments (or "points") on which they operate. Instead the definitions merely compose other functions, among which are combinators that manipulate the arguments.

## 6. Print listen

Nest siste steg: Vi trenger en funksjon som printer ut listen. Jeg ønsker også et ekstra linjeskift før og etter tallene. Her er hvordan jeg løser det i C#:

    static void PrintGame(List<int> list)
    {
        Console.WriteLine();
        foreach (var item in list)
            Console.Write(" " + item);
        Console.WriteLine("\n");
    } 

Det blir ikke så helt ulikt i Racket:

    (define (print-game list)
      (newline)
      (for ([n list])
        (printf " ~a" n))
      (newline)
      (newline))

## 7. Game loop

Det er på tide å sy alt dette sammen til et ferdig spill. Og vi begynner med C#. Endelig får du se hvordan spillet er ment å fungere..

    static void Main(string[] args)
    {
        Console.WriteLine(
            "Welcome to REVERSE -- A Game of Skill!\n\n" +
            "To win, all you have to do is arrange a list\n" +
            "of numbers (1 through 9) in numberical order\n" +
            "from left to right. To move, you tell me how\n" +
            "many numbers (counted from the left) to reverse.\n\n" +
            "No doubt you will like this game, but if you want\n" +
            "to quit, reverse 0 (zero).\n\n" +
            "Here we go ... the list is:");

        var game = NewGameList();
        PrintGame(game);
        int moves = 0; 
        while (true)
        {
            int choice = PromptChoice();
            if (choice == 0)
            {
                Console.WriteLine("O.K. Bye Bye!");
                break;
            }
            moves++;
            game.Reverse(0, choice);
            PrintGame(game);
            if (Done(game))
            {
                Console.WriteLine("You won it in {0} moves!", moves);
                break;
            }
        }
    }

Siden du allerede behersker C# eller et lignende språk behøver jeg ikke gå mer i detalj på hva jeg gjorde der. Jeg kan implementere en løsning som konseptuelt er helt lik i Racket, men det blir ikke spesielt fint. Det hadde vært bedre å bruke rekursjon enn en løkke. La oss først prøve å bruke rekursjon i C# for å se hvordan det blir.

    static void RunGame(int moves, List<int> game)
    {
        int choice = PromptChoice();
        if (choice == 0)
        {
            Console.WriteLine("O.K. Bye Bye!");
            return;
        }
        game.Reverse(0, choice);
        PrintGame(game);
        if (Done(game))
        {
            Console.WriteLine("You won it in {0} moves!", moves);
            return;
        }
        RunGame(moves + 1, game);
    }

    static void Main(string[] args)
    {
        // .. print header stuff here ..

        var game = NewGameList();
        PrintGame(game);
        RunGame(1, game);
    }

Ganske likt egentlig. Men denne løsningen er enklere å oversette til Racket:

    (displayln "Welcome to REVERSE -- A Game of Skill!           ")
    (newline)
    (displayln "To win, all you have to do is arrange a list     ")
    (displayln "of numbers (1 through 9) in numberical order     ")
    (displayln "from left to right. To move, you tell me how     ")
    (displayln "many numbers (counted from the left) to reverse. ")
    (newline)
    (displayln "No doubt you will like this game, but if you want")
    (displayln "to quit, reverse 0 (zero).                       ")
    (newline)
    (displayln "Here we go ... the list is:                      ")
    
    (define (run-game moves game)
      (let ([choice (prompt-choice)])
        (if (zero? choice)
            (displayln "O.K. Bye Bye!")
            (let ([game (reverse-slice game 0 choice)])
              (print-game game)
              (if (done? game)
                  (printf "You won it in ~a moves!" moves)
                  (run-game (add1 moves) game))))))
    
    (let ([game (new-game-list)])
      (print-game game)
      (run-game 1 game))

Og det var det :)

## 8. Til slutt

Spillet i sin helhet (både Racket og C#) er [tilgjengelig som en gist](https://gist.github.com/tormaroe/b4706b6f93f09d267e6d). **Reverse** er inspirert av Peter Sessions spill med samme navn, som ble publisert i 1978 i boken *BASIC Computer Games*. [Du kan studere orginalen her](http://www.atariarchives.org/basicgames/showpage.php?page=135).

Jeg har tidligere implementert to andre spill fra samme boken, begge i Chicken Scheme (som i praksis nesten er det samme som Racket): **[Word](http://blog.kjempekjekt.com/2014/03/23/spillkata-word/)** og **[Kinema](http://blog.kjempekjekt.com/2014/03/24/spillkata-2-kinema/)**. 

Her følger et eksempel på hvordan det ser ut når jeg spiller...

    Welcome to REVERSE -- A Game of Skill!
    
    To win, all you have to do is arrange a list
    of numbers (1 through 9) in numberical order
    from left to right. To move, you tell me how
    many numbers (counted from the left) to reverse.
    
    No doubt you will like this game, but if you want
    to quit, reverse 0 (zero).
    
    Here we go ... the list is:
    
     1 4 2 6 8 5 7 3 9
    
    Hom many shall I reverse? 5
    
     8 6 2 4 1 5 7 3 9
    
    Hom many shall I reverse? 8
    
     3 7 5 1 4 2 6 8 9
    
    Hom many shall I reverse? 2
    
     7 3 5 1 4 2 6 8 9
    
    Hom many shall I reverse? 7
    
     6 2 4 1 5 3 7 8 9
    
    Hom many shall I reverse? 6
    
     3 5 1 4 2 6 7 8 9
    
    Hom many shall I reverse? 2
    
     5 3 1 4 2 6 7 8 9
    
    Hom many shall I reverse? 5
    
     2 4 1 3 5 6 7 8 9
    
    Hom many shall I reverse? 2
    
     4 2 1 3 5 6 7 8 9
    
    Hom many shall I reverse? 4
    
     3 1 2 4 5 6 7 8 9
    
    Hom many shall I reverse? 3
    
     2 1 3 4 5 6 7 8 9
    
    Hom many shall I reverse? 2
    
     1 2 3 4 5 6 7 8 9
    
    You won it in 11 moves!
