---
scratch: true
title: "En funksjonell state machine"
layout: post
link: http://blog.kjempekjekt.com/2015/01/05/funksjonell-state-machine/
date: 2015-01-05T09:33:06.577Z
tags:
  - F#
  - Funksjonell programmering
---

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/12/fsm_happyangrysad.png"></p>

Einar, Bjørn Einar og Jonas fra Computas holdt en underholdende forelesning på NDC London i år som de kalte *The State of State*. Her snakket de mye om hvor nyttige **endelige tilstandsmaskiner** - eller *Finite State Machines* (FSM) - kan være. Dette er noe jeg også har skrevet om (se for eksempel *[En generisk state mashine](http://blog.kjempekjekt.com/2009/06/06/en-generisk-state-machine/)* fra 2009).

Et annet sentralt tema på konferansen var funksjonell programmering. Dette fikk meg til å tenke: *Hvordan ser en funksjonell tilstandsmaskin ut?*

La oss eksperimentere litt og se om vi kan finne det ut. Disclamer: Jeg har *ikke* googlet dette, men ville i stedet se hva jeg selv kunne komme opp med.

##Recap

En FSM i den objektorienterte verden er en entitet som har en bestemt tilstand. Tilstanden kan for eksempel være `Happy`. Maskinen blir så påvirket av en hendelse. Dette kan endre tilstanden til for eksempel `Angry`. I tillegg kan overgangen fra en tilstand til en annen ha *sideeffects*.

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/12/fsm_oop.png"></p>

Så hvordan skal vi gjøre dette i den funksjonelle programmeringsparadigmen? I FP løses alt med funksjoner, så da bør vel tilstandsmaskinen også være en funksjon. Funksjoner har ikke tilstand; i stedet kan vi lage en FSM-funksjon som tar inn en tilstand og en hendelse, og som returnerer en ny (potensiell) tilstand.

Hva med bieffekten av tilstandsendringen? Funksjonen kunne jo ha utført denne, men jeg har en mere spennende idé: Vi kan la funksjonen returnere bieffekten også!

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/12/fsm_fp.png"></p>

Å skyve bieffekter ut av funksjonene, og kun gjøre det i den "ytterste" delen av programmet, er en generell FP-teknikk. Resultatet blir kode som er enklere å teste og å forstå. 

##En FSM-funksjon

Det er på tide å kode litt. La oss bruke F# til å implementere tilstandsdiagrammet i starten av denne artikkelen. Språkets algebraiske datatyper lar oss uttrykke tilstandene og hendelsene slik:

````
type EmoState = Happy | Sad | Angry

type EmoEvent = YellAt | Comfort | Mock

type EmoEffect = string -> unit
````

`EmoEffect` inkluderte jeg mest for dokumentasjonens skyld. Den sier at en effekt er en funksjon som tar inn en streng (navnet på personen) og ikke returnerer noe som helst.

La oss så definere noen sånne effekt-funksjoner:

````
let becomeAngry subject = 
    printfn "%s goes bananas!!!" subject

let becomeSad subject =
    printfn "%s has a long face :-(" subject

let becomeHappy subject = 
    printfn "%s is happy again :)" subject
````

Nå kan vi lage en FSM-funksjon som definerer alle tilstandsendringer og returnerer ny tilstand og muligens en effekt.

````
let transition event state =
    match state, event with
    | Happy, YellAt  -> Angry, Some (becomeAngry)
    | Happy, Mock    -> Sad,   Some (becomeSad)
    | Sad, Comfort   -> Happy, Some (becomeHappy)
    | Angry, Comfort -> Sad,   Some (becomeSad)
    | _, _           -> state, None
````

Typesignaturen til denne funksjonen er `EmoEvent -> EmoState -> EmoState * (string -> unit) option`. Vi kan teste den, og utføre bieffekten om der er noen med en hjelpemetode jeg kaller `doEffect`:

````
let doEffect subject (state, effect) =
    match effect with
    | Some (effect) -> effect subject
    | None -> printfn "Transition had no effect."
    state

let newState = transition Mock Happy 
               |> doEffect "Bob"
````

Koden skriver ut `"Bob has a long face :-("` og `newState` får verdien `Sad`.

##En generisk FSM med overgangstabell

Fremgangsmåten jeg nettopp brukte fungerer greit nok; den kommuniserer godt og er enkel å forstå. Men den er ikke spesielt dynamisk - alle tilstandsendringene må hardkodes i `transition`. 

En alternativ strategi kunne vært å lage en liste med overganger, og gi denne til en funksjon som genererte en ny tilstandsmaskin basert på dem. Dette er omtrent det jeg gjorde i [min generiske FSM i C#](http://blog.kjempekjekt.com/2009/06/06/en-generisk-state-machine/).

La oss ta i bruk F# generics og definere en overgang slik:

````
type Transition<'s,'e,'x> = {
    GivenState : 's
    Event : 'e
    ThenState : 's
    Effect: ('x -> unit) option
    }
````

Jeg kan nå lage en tilhørende funksjon `transition` som finner en overgang fra en sekvens med overganger:

````
let transition transitions event state =
    let transitionLocator t =
        t.GivenState = state && t.Event = event
    match Seq.tryFind transitionLocator transitions with
    | Some (t) -> t.ThenState, t.Effect
    | None -> state, None
````

Typesignaturen til denne versjonen av FSM-funksjone er litt mer komplisert:

````
/// transitions:seq<Transition<'a,'b,'c>> ->
///  event:'b -> state:'a -> 'a * ('c -> unit) option
///  when 'a : equality and 'b : equality
````

Det er ikke tilfeldig at parameteret `transitions` kommer først. Jeg har nemlig tenkt å benytte **partial application**. Nedenfor definerer jeg alle overgangene og ender opp med en FSM-funksjon jeg kan bruke:

````
let fsm = transition
            [{ GivenState = Happy
               Event = YellAt
               ThenState = Angry
               Effect = Some (becomeAngry) }
             { GivenState = Happy
               Event = Mock
               ThenState = Sad
               Effect = Some (becomeSad) }
             { GivenState = Sad
               Event = Comfort
               ThenState = Happy
               Effect = Some (becomeHappy) }
             { GivenState = Angry
               Event = Comfort
               ThenState = Sad
               Effect = Some (becomeSad) }]
````

F# forteller meg at `fsm` har typen `EmoEvent -> EmoState -> EmoState * (string -> unit) option`, som var det jeg håpte på. Jeg kan nå teste `fsm` på samme måte som tidligere, og får samme resultat:

````
let newState = transition Mock Happy 
               |> doEffect "Bob"
````

##Komponere en FSM

Jeg liker teknikken med en overgangstabell - den er fleksibel og gjenbrukbar. Men siden poenget var å utforske tilstandsmaskiner i et funksjonelt språk så vil jeg forsøke en ting til: *Å komponere FSM ved hjelp av rene funksjoner.*

Tenk at du har en funksjon `makeTransition` som kan ta inn en funksjonell tilstandsmaskin og informasjon om en overgang, og som gir deg en ny tilstandsmaskin hvor overgangen er lagt til.

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/12/makeTransition.png"></p>

I F# kan man definere funksjoner som kan brukes *infix*, og på grunn av måten jeg skal bruke `makeTransition` på så ønsker jeg at denne funksjonen skal være det. Derfor gir jeg den i stedet det litt snåle navnet `-?->`, som i mitt hode illustrerer en potensiell overgang.

````
let (-?->) fsm t =
    fun event state ->
        if t.GivenState=state && t.Event=event
        then t.ThenState, t.Effect
        else fsm event state
````

`-?->` returnerer en funksjon som danner en closure over funksjonen `fsm` og overgangs-variabelen `t`. Denne closuren tar inn et event og en state. Hvis eventet og tilstanden matcher overgangen definert i `t` så returneres resultatet (ny state og potensiell effekt). Hvis ikke antar funksjonen at det kan finnes flere overganger definert i `fsm`, og evaluerer denne med argumentene.

Kode som dette gjør at jeg føler meg smart, men det er egentlig ganske grunnleggende rekursjon.

Nå kan jeg definere tilstandsmaskinen min igjen ved å komponere de ulike overgangene sammen med en *default* overgang som brukes om ingen andre overganger matchet event og state.

````
let defaultTransition _ state = state, None

let fsm =
    defaultTransition
    -?-> { GivenState = Happy
           Event = YellAt
           ThenState = Angry
           Effect = Some (becomeAngry) }
    -?-> { GivenState = Happy
           Event = Mock
           ThenState = Sad
           Effect = Some (becomeSad) }
    -?-> { GivenState = Sad
           Event = Comfort
           ThenState = Happy
           Effect = Some (becomeHappy) }
    -?-> { GivenState = Angry
           Event = Comfort
           ThenState = Sad
           Effect = Some (becomeSad) }
````

Resultatet er at `fsm` kan brukes akkurat som tidligere, men i stedet for å slå opp overgangen i en sekvens av overganger vil den nå søke seg gjennom overgangene i en sekvens med funksjonskall. Om dette er en fordel eller ikke kommer kanskje an på hvordan tilstandsmaskinen skal brukes.

La meg avslutte med å vise hvordan man kan bruke `fold` til å kjøre gjennom en serie med hendelser.

````
let subject = "Sandra"
let initialState = Happy
let events = [YellAt; Mock; Comfort; Comfort]

events 
|> Seq.fold 
    (fun state event ->
        fsm event state 
        |> doEffect subject) 
    initialState
|> printfn "Final state is %A"

(* Skriver ut:
   Sandra goes bananas!!!
   Transition had no effect.
   Sandra has a long face :-(
   Sandra is happy again :)
   Final state is Happy
*)
````

##Wrap-up

Jeg håper du har klart å henge med, og synes dette har vært interessant. Jeg synes i alle fall det er gøy å leke meg med ulike måter å modellere ting på i F#.

Her er noen eksterne lenker du kanskje vil ta en titt på nå som du har sett min fremgangsmåte:

* [Designing with types: Making state explicit](http://fsharpforfunandprofit.com/posts/designing-with-types-representing-states/) ([Scott Wlaschin](https://twitter.com/ScottWlaschin))
* [Making a simple State Machine with F# Actors](http://relentlessdevelopment.wordpress.com/2013/07/30/making-a-simple-state-machine-with-f-actors/) ([Grant Crofton](https://twitter.com/relentlessdev))
* [Finite State Machine Compiler](http://trelford.com/blog/post/FSM.aspx) ([Phillip Trelford](https://twitter.com/ptrelford))