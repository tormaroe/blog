---
title: "Post #666: Assembly"
layout: post
link: http://blog.kjempekjekt.com/2014/04/24/post-666-assembly/
date: 2014-04-24T20:43:27.842Z
tags:
  - Assembly
---
Det gikk plutselig opp for meg at jeg aldri har kodet assembly. Eller, det er ikke helt riktig - jeg kodet noen få linjer Turbo Assembler i studietiden. Jeg har også gjort litt i stack-basert assembler på en VM, men det er jo ikke det samme som å gå native. Så hva passer da bedre for bloggpost nummer 666 enn å gjøre nettopp dette?!

Og jeg vet selvfølgelig akkurat hvilken oppgave jeg vil løse. Yes, som vanlig skal jeg finne summen av alle multipler av 3 eller 5 under 1000.

## Valg av assembler

Jeg valgte å gjøre dette i Linux, og jeg hadde gcc tilgjengelig. Jeg forstod så at jeg hadde et valg mellom to ulike typer syntakser: intel eller AT&T. Jeg gikk for AT&T-syntaks, selv om jeg skjønte etterpå at denne er mindre populær nå om dagen.

Etterhvert som programmet utviklet seg ble det mer og mer knotete å få det til å virke. Med litt hjelp fant jeg ut at årsaken var at jeg var på et 64bits OS, så da måtte jeg assemble på en litt spesiell måte. For å assemble koden (filen `auler.s`) til den eksekverbare filen `euler` kjørte jeg:

    $ gcc -m32 euler.s -o euler

Og så kunne jeg kjøre den med:

    $ ./euler

## Iterere over 1000 tall

Jeg bryter opp programmet litt slik at jeg kan forsøke å forklare de ulike delene. Først kommer noen deklarasjoner:

~~~avrasm
.code32            # jeg ønsker 32bits kode
.section .data     # her begynner dataseksjonen
msg: 
  .string "%u\n"   # formatstreng for utskrift
 
.section .text     # her begynner kodeseksjonen
.globl main        # 'main' er en global label
~~~

Og så begynner `main`:

~~~avrasm
main:
  movl $1000, %ecx # move 1000 into range register
  movl $0, %ebx    # initial sum is zero
~~~

`ecx`-registeret skal fungere som en teller, men jeg vil spare summen i `ebx`. Nå har jeg initiert dem, og kan begynne på kode som skal iterere fra 1000 til 0:

~~~avrasm
start_loop:
  cmpl $0, %ecx    # have we reached the end?
  je loop_exit     # if true, exit loop
  decl %ecx        # next value in range
~~~

Jeg sammenligner `ecx` med 0, og hvis de er like vil jeg hoppe til en label jeg har kalt `loop_exit` (defineres senere). Hvis vi ikke har nådd 0 dekrementerer jeg telleren med 1. Løkken starter altså egentlig på tallet 999 (som er korrekt i forhold til oppgaven).

Her følger resten av løkken:

~~~avrasm
  movl $3, %edi
  call add_if_multiple
  
  cmpl $0, %edx    # Skip multiple of 5 test
  je start_loop    # if it was multiple of 3
  
  movl $5, %edi
  call add_if_multiple
  
  jmp start_loop   # loop back to top for next number
~~~

Jeg kommer til å lage en liten subrutine jeg kaller `add_if_multiple` som vil legge tellerens verdi til summen hvis telleren er et multippel av et eller annet tall - nemlig det tallet som befinner seg i register `edi`. Derfor putter jeg først 3 i `edi` og kaller rutinen.

Etter subrutinen er ferdig vet jeg (fordi jeg har gjort det sånn) at om `edx` er lik 0 så var tallet et multippel av 3. Da kan vi hoppe direkte til neste iterasjon med `je start_loop`. Hvis ikke må vi sjekke for multipler av 5 før vi hopper opp igjen.

## Multippel?

Da er det på tide å se hvordan subrutinen ser ut:

~~~avrasm
add_if_multiple:
  movl $0, %edx    # prepare for divition: clear edx
  movl %ecx, %eax  # set number to be divided..
  divl %edi        # divide %eax by %edi
                   # result in %eax, reminder in %edx 
  cmpl $0, %edx    # is reminder '0'?
  jne add_if_multiple_exit  # jump if not...
  call add_to_sum 
add_if_multiple_exit:
  ret
~~~

For å finne ut om et tall `x` er et multippel av `y` må jeg dele `x` på `y` og se om jeg får en rest. Det finnes ingen modulo-operator i x86-assembly, men `divl` som gjør samme nytten. Hvis resten *ikke er lik 0* hopper jeg ned til en label som returnerer fra rutinen, men hvis den *er* 0 så kaller jeg først en ny subrutine som legger telleren til summen:

~~~avrasm
add_to_sum:
  addl %ecx, %ebx  # add number to sum
  ret
~~~

Jeg tviler på om en hardbarket assemblykoder ville laget en subrutine for en *oneliner* som dette, men jeg gjorde nå dette bare for å eksperimentere og lære..

## Å skrive ut resultatet

Det som gjenstår nå er det som skal skje når iterasjonen er ferdig - nemlig å skrive ut resultatet. Jeg knotet endel med hvordan jeg skulle få til dette, og måtte også her ha hjelp av noen som hadde gjort assembly før. Selv da brukte vi litt vel mye tid på å få det til.

Løsningen vi valgte var å linke inn *libc* - utskrift med systemkall i rå assembly ble bare for mye stress. gcc linker inn libc automatisk, så alt jeg behøvde å gjøre var å kalle `printf`-funksjone jeg var ute etter etter å ha lagt argumentete på stacken:

~~~avrasm
loop_exit:
  pushl %ebx       # argument to printf (the answer)
  pushl $msg       # argument to printf (format string)
  call printf      # print answer
~~~

## Avslutte programmet

Helt til slutt må vi avslutte programmet på riktig måte. Dette er et Linux-systemkall, og det ser slik ut:

~~~avrasm
  movl $1, %eax    # 1 is the exit() syscall
  movl $0, %ebx    # 0 blir returverdien (alt ok)
  int $0x80        # do system call (exit)
~~~

## Konklusjon

Jeg visste jo at native assembly var tungvindt og smertefullt, men jeg ble likevel overrasket over *hvor** tungvindt og smertefullt det faktisk var å komme frem til et program som gjorde det jeg ønsket. Det var ikke logikken som var det verste. Utfordingene lå i å forstå hva som gikk galt når ting sluttet å fungere, å skjønne at problemene var knyttet til 64bit, og å i det hele tatt få skrevet ut noe. Å google etter løsninger var heller ikke uproblematisk.

Jeg skjønner jo at ting blir bedre når man får litt rutine, men jeg mistet helt lysten til å gjøre mer av dette, og det kan nok gå en stund før du får se assemblykode på denne bloggen igjen :)
