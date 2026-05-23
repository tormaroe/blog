---
title: "10 språk som kompilerer til native"
layout: post
link: http://blog.kjempekjekt.com/2015/04/01/10-som-kompilerer-til-native/
date: 2015-04-01T09:32:02.359Z
tags:
  - Polyglot
---
<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2015/04/give_them_java.jpg"></p>

Jeg har aldri hatt særlig lyst til å bruke C eller C++, men de har absolutt sine områder hvor de fungerer bedre enn VM-baserte språk som C# og Java, eller tolkede språk som Ruby / Python / JavaScript. Derfor er jeg på leting etter språk som kan erstatte C/C++.

La meg kvalifisere hva jeg mener med *erstatte*: Jeg mener at jeg ønsker et språk som enkelt lar meg kompilere og deploye et program, **uten avhengigheter** til en installert tolker eller virtuell maskin (*standalone executable*). Programmet bør kunne kompileres til å fungere på alle populære platformer (i alle fall Windows, Linux og Mac). Og programmet bør være raskt - *ytelse* er en av hovedgrunnene til at C og C++ benyttes i dag.

Jeg mener ikke at språket jeg ser etter *kommer* til å erstatte C eller C++, eller at det har potensiale til å gjøre det for *alle* områder hvor språkene benyttes i dag. Det viktige er at det kan være et bra alternativ _for meg_!

I denne posten vil jeg ta en rask titt på 10 språk som alle kan være det jeg ser etter.

<div class="pull-right" style="margin-left:10px;">![Go](http://blog.kjempekjekt.com/uploads/2015/04/go.png)</div>

## Go

**Go** ([golang.org](https://golang.org/)) har fått endel traction (47. plass på Tiobe's popularitetsindeks), sansynligvis fordi det er Google som står bak. De har utviklet et språk som skulle være enkelt for uerfarne utviklere (rett fra universitetet) å bli produktive i. Det er enkelt å lære, minner mye om C, og det er ikke så lett å skyte seg selv i foten.

Og det gjør språket litt kjedelig. Noen mener det er [en fornærmelse av intelligente utviklere](http://nomad.so/2015/03/why-gos-design-is-a-disservice-to-intelligent-programmers/). Hovedproblemet er at det begrenser dine muligheter til å lage gode abstraksjoner, og fører til endel *boilerplate*. Ja, det yter bra, og kompilerer for alle platformer man kan drømme om.., men det er faktisk litt uinspirerende. Og programmering skal være gøy!

    package main

    import "fmt"

    func main() {
        for i := 1; i <= 100; i++ {
            switch {
            case i%15==0:
                fmt.Println("FizzBuzz")
            case i%3==0:
                fmt.Println("Fizz")
            case i%5==0:
                fmt.Println("Buzz")
            default:
                fmt.Println(i)
            }
        }
    }

Så jeg dropper Go og går videre... *(pun intended, kind of)*

<div class="pull-right" style="margin-left:10px;">![D](http://blog.kjempekjekt.com/uploads/2015/04/d.png)</div>

## D

**D** ([dlang.org](http://dlang.org/)) har som mål å være et alternativ til C++. Språket dukket opp i 2001, men D2 (versjon 2, en stor endring fra D1) er fra 2007. Den mest kjente brukeren av D er Facebook - [annensert her](http://forum.dlang.org/thread/l37h5s$2gd8$1@digitalmars.com#post-l37h5s:242gd8:241:40digitalmars.com).

    import std.stdio;

    void fizzBuzz(in uint n) {
        foreach (immutable i; 1 .. n + 1)
            if (!(i % 15))
                "FizzBuzz".writeln;
            else if (!(i % 3))
                "Fizz".writeln;
            else if (!(i % 5))
                "Buzz".writeln;
            else
                i.writeln;
    }

Sammenlignet med C++ lover D at problem løses med færre linjer kode, færre bugs, og like god ytelse. Språket ligger akkurat nå på 31. plass på Tiobe's popularitetsindeks, og jeg spår at flere og flere kommer til å høre om og ta i bruk D i løpet av de neste årene - selv om Go sikkert kommer til å spise opp forspranget om ikke lenge.

<div class="pull-right" style="margin-left:10px;">![OCaml](http://blog.kjempekjekt.com/uploads/2015/04/ocaml.png)</div>

## OCaml

**OCaml** ([ocaml.org](https://ocaml.org/)) er nesten 20 år gammelt, men har utviklet seg endel de siste ti, og jeg tror det stadig får flere brukere. ML ligger på 25. plass på Tiobe's indeks, og jeg lurer på om OCaml inngår der.

    let fizzbuzz i =
      match i mod 3, i mod 5 with
        0, 0 -> "FizzBuzz"
      | 0, _ -> "Fizz"
      | _, 0 -> "Buzz"
      | _    -> string_of_int i

    let _ =
      for i = 1 to 100 do print_endline (fizzbuzz i) done

Ocaml velges i stedet for C/C++ til systemprogrammering fordi den kraftige statiske typingen gir færre feil / tryggere kode. Et eksempel på et større prosjekt hvor man har valgt OCaml er [Mirage OS](http://openmirage.org/), et operativsystem for unikernels som kjører på Xen hypervisor.

OCaml frister, siden det er såpass likt F#. Mine første forsøk med språket gikk derimot ikke så bra - jeg fikk problemer med å bruke tredjeparts biblioteker. Dette er helt sikkert overkommelig, men det fungerte i alle fall ikke helt som lovet.

<div class="pull-right" style="margin-left:10px;">![Haskell](http://blog.kjempekjekt.com/uploads/2015/04/haskell.png)</div>

## Haskell

**Haskell** ([haskell.org](https://www.haskell.org/)) er en god C/C++ erstatter for mange (topp 50 på Tiobe).

    main = mapM_ (putStrLn . fizzbuzz) [1..100]

    fizzbuzz x
        | x `mod` 15 == 0 = "FizzBuzz"
        | x `mod`  3 == 0 = "Fizz"
        | x `mod`  5 == 0 = "Buzz"
        | otherwise = show x

For meg blir språket litt for spesielt. Jeg har forsøkt å lære meg det, men det er litt for krevende til at jeg klarer å bruke det uten å gjevnlig holde kunnskapen ved like. Skal jeg velge Haskell så blir det av andre grunner enn at det lar meg kompilere små, standalone programmer.

<div class="pull-right" style="margin-left:10px;">![Rust](http://blog.kjempekjekt.com/uploads/2015/04/rust.png)</div>

## Rust

**Rust** ([rust-lang.org](http://www.rust-lang.org/)) er et programmeringsspråk utviklet av Mozilla Research. En alpha-utgave av versjon 1.0.0 er tilgjengelig, så språket er snart mulig å ta i bruk for alvor.

    fn main() {
        for n in 1..101 {
            if n % 15 == 0 {
                println!("fizzbuzz");
            } else if n % 3 == 0 {
                println!("fizz");
            } else if n % 5 == 0 {
                println!("buzz");
            } else {
                println!("{}", n);
            }
        }
    }

Syntaksen minner om C/C++, men semantisk er det svært ulikt. Fokuset er på sikkerhet, kontroll av minnebruk, og samtidighet. Typesystemet har hentet mye inspirasjon fra Haskell, og Rust blir et rikt språk som støtter funksjonell programmering, actors, imperativ kode og objektorientering. Språknerder verden over fryder seg :)

Jeg så litt på Rust for et par år siden. Den gang syntes jeg det var vanskelig å komme i gang. Det var kanskje ikke så rart, for språket utviklet seg hele tiden, og dokumentasjon skrevet to uker tidligere var ikke lenger noe man kunne stole på. Men nå når versjon 1 lanseres må jeg nok snart ta en ny titt.

Men om jeg bare skal gjøre noe lite - som å lage en liten konsollapplikasjon - så føles det som litt overkill å sette seg inn i Rust.

<div class="pull-right" style="margin-left:10px;">![Nim](http://blog.kjempekjekt.com/uploads/2015/04/nim.png)</div>

## Nim

**Nim** ([nim-lang.org](http://nim-lang.org/)), tidligere *Nimrod*, er et språk jeg har eksperimentert endel med, og [blogget om](http://blog.kjempekjekt.com/tags/nimrod/). Enkelte miljøer er ganske opptatt av språket, og følger spent med på utviklingen - som for eksempel [utviklermiljøet på reddit](http://www.reddit.com/r/programming) - men for de aller fleste programmerere er Nim fortsatt totalt ukjent.

    for i in 1..100:
      if i mod 15 == 0:
        echo("FizzBuzz")
      elif i mod 3 == 0:
        echo("Fizz")
      elif i mod 5 == 0:
        echo("Buzz")
      else:
        echo(i)

Jeg liker språket svært godt. Det jeg ikke liker er at det foreløpig føles så lite. Såvidt jeg vet utvikles Nim av én person, uten backing fra noe selskap, og det gjør at jeg blir litt usikker i forhold til språkets fremtid. Jeg håper det kan bli mere populært på sikt, få et levende community, og et rikere utvalg av biblioteker - men tiden vil vise.

<div class="pull-right" style="margin-left:10px;">![Red](http://blog.kjempekjekt.com/uploads/2015/04/red.png)</div>

## Red

**Red** ([red-lang.org](http://www.red-lang.org/)) er et språk under utvikling, inspirert av Rebol ([som jeg har litt erfaring med](http://blog.kjempekjekt.com/tags/rebol/)). Utviklerne har nå startet et selskap, fått litt økonomisk backing, og det gir litt mer trygghet i at dette faktisk kan bli til noe. For jeg synes Rebol er et ganske spennende språk, og ønsker gjerne at vi får et lignende språk som kan bli litt mere mainstream (ref. det litt spesielle Rebol-miljøet).

    repeat i 100 [
        print switch/default 0 compose [
            (mod i 15) ["fizzbuzz"]
            (mod i 3)  ["fizz"]
            (mod i 5)  ["buzz"]
        ][i]
    ]

PS: Koden over er gyldig i Rebol. Om det er gyldig Red-kode aner jeg ikke - det vil tiden vise. Du kan laste ned og bygge Red, men jeg har ikke hatt særlig hell de gangene jeg har forsøkt.

<div class="pull-right" style="margin-left:10px;">![Racket](http://blog.kjempekjekt.com/uploads/2015/04/racket.png)</div>

## Racket

**Racket** ([racket-lang.org](http://racket-lang.org/)) brukte jeg for første gang for bare noen måneder siden (se [mitt første program i Racket](http://blog.kjempekjekt.com/2014/11/29/mitt-forste-program-i-racket/)). Og det var som jeg sier i blogposten en udelt positiv opplevelse.

    (for ([n (in-range 1 101)])
      (displayln
       (match (gcd n 15)
         [15 "fizzbuzz"]
         [3 "fizz"]
         [5 "buzz"]
         [_ n])))

Racket har først og fremst to ting som taler mot at det blir en C/C++ erstatning. For det første er det en Lisp, noe som fremkaller allergiske reaskjoner hos mange utviklere. For det andre har det et rykte for å være et lekespråk, eller kanskje mer presist et språk og utviklingsmiljø for akademikere som ønsker å eksperimentere.

Jeg er også usikker på om ytelsen er sammenlignbar med C. Det bør jeg rett og slett teste.

<div class="pull-right" style="margin-left:10px;">![GNOME](http://blog.kjempekjekt.com/uploads/2015/04/gnome.png)</div>

## Vala (og Genie)

**Vala** ([wiki.gnome.org/Projects/Vala](https://wiki.gnome.org/Projects/Vala)) er et nytt (2006) språk med en syntaks som er nesten identisk med C#. Jeg har ikke testet det enda, men det virker interessant. Språket er en del av GNOME-prosjektet, og vil nok bli mest brukt på Linux, men det er også anvendelig på Windows.

    int main() {
    	for(int i = 1; i < 100; i++) {
    		if(i % 3 == 0) stdout.printf("Fizz");
    		if(i % 5 == 0) stdout.printf("Buzz");
    		if(i % 3 != 0 && i % 5 != 0) stdout.printf("%d", i);
    		stdout.printf("\n");
    	}
      return 0;
    }

Vala er interessant fordi man kan gjenbruke C#-kompetanse, men kompilere til *native*. Men om det ikke er nok kan du også ta en titt på **[Genie](https://wiki.gnome.org/Projects/Genie)**, som bygger på Vala men gir deg en syntaks mer lik Python (eller [Boo](http://blog.kjempekjekt.com/tags/boo/) om du vil).

<div class="pull-right" style="margin-left:10px;">![Crystal](http://blog.kjempekjekt.com/uploads/2015/04/crystal.png)</div>

## Crystal

**Crystal** ([crystal-lang.org](http://crystal-lang.org/)) er det siste programmeringsspråket jeg har hørt om. Det har en Ruby-inspirert syntaks, og det spesielle med Crystal er at selv om det er statisk typet, så må man ALDRI spesifisere en type noe sted.

Språket er fortsatt under utvikling, så det er alt for tidlig å si hvor det vil ende. Men om det kan generere effektiv *native* kode så vil det være svært spennende.

Noe å følge med på...

## KONKLUSJON

Ble du noe klokere?

Jeg knytter endel emosjoner og magefølelser til valg av språk, men jeg forsøker å rasjonalisere også. Språket som stikker seg frem som mulig C/C++ erstatning for meg akkurat nå, når jeg skal gjøre småting, er faktisk Racket, med Nim på en andreplass og Go på en uinspirerende tredje. Det at jeg har prøvd disse språkene har selvsagt endel å si.

Når det kommer til mere fullgode erstatninger for C++ så har jeg mest forhåpninger til Rust, med D som et bra alternativ som allerede er klart for *prime time*.

Vala (og Genie) er språk jeg må teste ut før jeg tørr si noe mer om hvor anvendelige de vil være. Og så ser jeg frem til at Red, Crystal og forsåvidt også Nim skal bli litt mere modne.

Hmm, kanskje jeg burde implementere et enkelt program i et utvalg av disse språkene og teste litt ytelse nå?

## Andre muligheter?

<p class="text-center">![Common Lisp](http://blog.kjempekjekt.com/uploads/2015/04/lisplogo_alien_256.png)</p>

Flere implementasjoner av [Common Lisp](https://common-lisp.net/) gir deg også muligheten til å pakke og *shippe* eksekverbare programmer. Men jeg har forsøkt, og det er en terskel å få det til - i alle fall når koden har avhengigheter til tredjeparts biblioteker. Dessuten blir den eksekverbare filen gjerne ganske stor. Men om du er interessert kan du [ta en titt her](http://stackoverflow.com/questions/25046/lisp-executable).

    (loop as n from 1 to 100
          as fizz = (zerop (mod n 3))
          as buzz = (zerop (mod n 5))
          as numb = (not (or fizz buzz))
          do
      (format t
       "~&~:[~;Fizz~]~:[~;Buzz~]~:[~;~D~]~%"
       fizz buzz numb n))

Til slutt bør det nevnes at Microsoft kommer til å lansere noe de kaller [.NET Native](https://msdn.microsoft.com/en-us/vstudio/dotnetnative.aspx). Dette er spennende, men inntil videre har fokuset kun vært på Windows Store apps.
