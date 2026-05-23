---
title: "Perl 6 er endelig her - er det interessant?"
layout: post
link: http://blog.kjempekjekt.com/2015/12/28/perl6-er-her/
date: 2015-12-28T00:48:31.102Z
tags:
  - Perl
---

**[Perl 6](http://perl6.org/)** er endelig sluppet i en stabil versjon. Perl har aldri vært et viktig språk for meg, men versjon 6 - som egentlig er et helt nytt språk - har potensiale. Jeg føler det er viktig å ta en titt, så her følger noen tanker og smakebiter...

![Perl6](http://blog.kjempekjekt.com/uploads/2015/12/perl6.png)

## Litt historie

Larry Wall startet å utvikle Perl i 1987. Det ble etterhvert et viktig språk, ikke minst under internett-revolusjonen på 90-tallet. I starten ble det sagt at "Internett kjørte på Perl".

Perl var også en viktig inspirasjonskilde for både Python, PHP og Ruby, som etterhvert overtok mye av Perls rolle og popularitet.

Perl er kjent for å være et litt kryptisk språk; det har *mye* syntaks og "magiske variabler" som gjør at du kan uttrykke *mye* med få tegn, og det er alltid mange forskjellige måter å gjøre det samme på. Dette har gjort at Perl har fått et rykte for å være kryptisk (at Larry Wall har vunnet IOCCC - *[International Obfuscated C Code Content](https://en.wikipedia.org/wiki/International_Obfuscated_C_Code_Contest)* - to ganger forklarer kanskje endel). Språkets motto er at **enkle ting skal være enkelt, og vanskelige ting skal være mulig**.

Lisp-hacker [Doug Hoyte](http://hoytech.com/about) (forfatter av *[Let Over Lambda - 50 Years of Lisp](http://letoverlambda.com/)*) sier at etter Lisp og C så er Perl det viktigste språket å lære seg - ikke bare fordi det er umåtelig praktisk, men også på grunn av filosofien:

> "If Lisp is the result of taking syntax away, Perl is the result of taking syntax all the way."

## Perl 6

> "The Perl 6 community has been working toward this release over the last 15 years."
> <small>[Christmas is here, by Coke](https://perl6advent.wordpress.com/2015/12/25/christmas-is-here/)</small>

Arbeidet som nå endelig har blitt til Perl 6 startet i år 2000. Versjonen er *ikke* bakoverkompatibel med Perl 5. Men hva er det som nå er klart?

Det som nettopp har blitt publisert er først og fremst to ting: Den første deler er språkets spesifikasjon, som består av 120 000 enhetstester. Den andre er en Perl 6 kompilator som heter **Rakudo**. [Dokumentasjonen er også oppdatert](http://perl6intro.com/), og du kan nå ta språket i bruk uten å være redd for at språket vil endre seg under føttene på deg.

Derimot må vi nok forvente at det vil jobbes mye med ytelsesforbedringer fremover, og antallet tilgjengelige moduler vil nok være noe begrenset i en periode. Det er nå likevel på tide å ta en titt på hva språket har å tilby.

## Features

Perl 6 er et moderne og rikt språk, så det er mye å sette seg inn i. Her nevner jeg kun noen høydepunkt...

Perl 6 er et multiparadigmespråk, og støtter objektorientering, funksjonell programmering inkludert lazy lists, prosedyrebasert kode, og samtidighetsprogrammering. Språket har også gode fasiliteter for å kalle C/C++ kode, og man kan embedde Perl 5 inline.

Regulære uttrykk har alltid vært en viktig del av Perl, og Perl 6 utvider hva du kan gjøre med dem. Med Perl 6 kan du definere uttrykk kraftige nok til å parse Perl 6 selv. 

Noe som er veldig spennende er at Perl 6 har "gradvis typing". Du kan begynne med et dynamisk typet program, og så spesifisere typer utvalgte steder for å gjøre koden tryggere og raskere.

Du kan også definere operatorer (prefix, postfix, infix og circumfix), og som i Ruby har du blokker med kode. Dette kan du for eksempel kobinere til å definere en `times` operasjon:

```
sub infix:<times>(Int $n, Block $r) {
  for ^$n {
    $r();
  }
}

3 times -> { say "hello" }; #=> hello
                            #=> hello
                            #=> hello
```

*Circumfix* er forresten et interesant konsept som gjør at du kan eksperimentere med syntaks på nye og uante måter. Et eksempel:

```
sub circumfix:<[ ]>(Int $n) {
  $n ** $n
}

say [5]; #=> 3125
```

Vi har også varianten *postcircumfix*:

```
sub postcircumfix:<{ }>(Str $s, Int $idx) {
  # post-circumfix is
  # "after a term, around something"
  $s.substr($idx, 1);
}

say "abc"{1}; #=> b
```

Mye av Perl 6 er bygget opp av disse operatorene, men de kan altså også defineres av oss *brukere*, som gjør Perl 6 til en kraftig syntax-verktøykasse. 

Videre har Perl 6 ulike måter å kalle funksjoner på, mye likt hva du finner i for eksempel [Nim](http://blog.kjempekjekt.com/tags/nimrod/). Her er et eksempel på to linjer som uttrykker det samme:

```
my @final-array = reverse(sort(unique(@array)));

my @final-array = @array.unique.sort.reverse;
```

En annen måte å kjede sammen operasjoner på kalles *forward feed*:

```
my @array = <7 8 9 0 1 2 4 3 5 6>;
@array ==> unique()
       ==> sort()
       ==> reverse()
       ==> my @final-array;
say @final-array;
```

Og så har vi *backward feed*:

```
my @array = <7 8 9 0 1 2 4 3 5 6>;
my @final-array-v2 <== reverse()
                   <== sort()
                   <== unique()
                   <== @array;
say @final-array-v2;
```

Perl 6 har også noe de kaller *hyper operator* - `>>` - som jeg ville sagt var det samme som *map*. For å skrive ut alle primtall fra et array:

```
my @array = <0 1 2 3 4 5 6 7 8 9 10>;
say @array>>.is-prime;
```

Og her skraper vi altså bare litt i overflaten.., jeg ville bare gi deg et lite inntrykk av hvordan det ser ut.

## Hva jeg tenker..

Akkurat nå er hodet mitt fullt av andre ting - som [Common Lisp](http://blog.kjempekjekt.com/tags/common-lisp/) for eksempel - så jeg ser ikke for meg at det blir noe dypdykk i Perl med det første. Men jeg synes språket er spennende. I dag bruker jeg typisk Python eller Ruby om jeg trenger å raske sammen et script som parser noen filer eller lignende. Jeg tror Perl 6 kunne vært vel så bra til dette formålet.

## Ressurser

Språket lever på [perl6.org](http://perl6.org/), og [perl6intro.com](http://perl6intro.com/) er sansynligvis den beste ressursen for å lære det grundig. [Learn perl6 in Y minutes](https://learnxinyminutes.com/docs/perl6/) kan gi deg en rask oversikt, om du liker den slags.

Og [pl6anet.org](http://pl6anet.org/) virker å være et greit sted å holde seg oppdatert på community news.

## Larry Wall sitat

![Larry Wall](http://blog.kjempekjekt.com/uploads/2015/12/Larry_Wall_YAPC_2007.jpg)

Larry Wall er en fasinerende mann; utdannet lingvist, utpreget religiøs, og flommer over av både dype tanker, sterke meninger, og mye humor! Jeg fikk lyst til å avslutte med et Larry-sitat om hvor fantastiske (og lite fantastiske) språk er:

> I simultaneously believe that languages are wonderful and awful. You have to hold both of those. Ugly things can be beautiful. And beautiful can get ugly very fast. You know, take Lisp. You know, it's the most beautiful language in the world. At least up until Haskell came along. But, you know, every program in Lisp is just ugly. I don't figure how that works.