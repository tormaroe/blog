---
title: "Morsom kodetrening"
layout: post
link: http://blog.kjempekjekt.com/2018/03/05/morsom-kodetrening/
date: 2018-03-05T23:57:31.746Z
tags:
  - Clojure
  - Kata
---

Synes du det er gøy å kode, men du mangler oppgaver å løse? Det finnes mange ressurser på nettet som tilbyr programmeringsoppgaver i ulik vanskelighetsgrad. Tidligere har jeg brukt [Project Euler](https://projecteuler.net/) endel, men de oppgavene du finner der blir kanskje litt for matematiske for mange. Jeg bestemte meg for å ta en titt på hva som er de mest spennende av disse ressursene akkurat nå.

**[CodinGame](https://www.codingame.com)** er kanskje den mest *fancy* ressursen jeg har funnet. Dette er rett og slett et spill hvor du må programmere for å vinne. Du velger selv mellom 26 ulike programmeringsspråk, og alt du trenger av utviklingsmiljø får du i nettleseren. Du får en god del hjelp i starten, og finner raskt ut hvordan du skal styre din pod racer rundt på en bane. Det vanskelige er å finne den optimale taktikken for å vinne mot alle de andre pilotene.

![CodinGame screenshot](/uploads/2018/03/codingame.png) 

**[Codefights](https://codefights.com)** er en annen ressurs som også bruker gamification for å motivere deg til å programmere. Her kan du velge mellom hele 38 språk, og du får oppgaver i stigende vanskelighetsgrad. Igjen får du en god del veiledning, en bra online editor, samt et batteri med enhetstester for hver oppgave som du må gjøre grønne.

![Codefights screenshot](/uploads/2018/03/codefight.png) 

**[Hackattic](https://hackattic.com/)** (eller bare **h^**) er en mindre ambisiøs ressurs med langt færre oppgaver, men den er vel så spennende for dem som har litt lengre fartstid. Her blir du utfordret til å utforske ting du sansynligvis ikke har så mye erfaring med.

![Hackattic screenshot](/uploads/2018/03/hackattic.jpg)

Den første oppgaven jeg har løst på Hackattic heter [WebSocket chit chat](https://hackattic.com/challenges/websocket_chit_chat). Den er ikke spesielt vanskelig, men en grei treningsoppgave hvor man må lage en WebSocket-klient og kommunisere med Hackattic-serveren.

Jeg valgte å bruke Clojure denne gangen, og det tok meg omtrent en time å løse oppgaven. Programmet jeg kom opp med følger i sin helhet nedenfor. 

Bortsett fra hvordan jeg bruker WebSockets fra bibloteket [Gniazdo](https://github.com/stalefruits/gniazdo), er `checkpoint!` kanskje den mest spennende funksjonen. Den er en *closure* (en *[let over lambda](https://letoverlambda.com/)*) som husker hva klokken var sist den ble evaluert, og som returnerer forskjellen mellom det tidspunktet og nå i millisekunder.

```
(ns tman.hackattic.chit-chat
  (:require [cheshire.core :refer :all] ; json lib
            [gniazdo.core :as ws] ; websocket lib
            [org.httpkit.client :as http]
            [clojure.string :as str])
  (:gen-class))

(def base-url "https://hackattic.com/challenges/websocket_chit_chat/")
(def ws-address "wss://hackattic.com/_/ws/")
(def access-token "secret provided by hackattic..")
(def problem-token (atom ""))
(def socket (atom nil))

(defn now []
  (. System (nanoTime)))

(def checkpoint!
  (let [last-checkpoint (atom 0)]
    (fn []
      (let [old-value @last-checkpoint
            now-value (now)]
        (swap! last-checkpoint (fn [_] now-value))
        (/ (double (- now-value old-value))
           1000000.0)))))

(defn get-guess [duration]
  (condp > duration
    1100 "700"
    1750 "1500"
    2250 "2000"
    2750 "2500"
    "3000"))

(defn handle-ping []
  (let [duration (checkpoint!)
        guess (get-guess duration)]
    (println "Duration" duration "msec -> My guess" guess)
    (ws/send-msg @socket guess)))

(defn grab-token []
  (let [url (str base-url "problem?access_token=" access-token)
        res (http/get url)
        token (:token (parse-string (:body @res) true))]
    (swap! problem-token
           (fn [_] token))))

(defn post-solution [secret]
  (println "Secret:" secret)
  (let [url (str base-url "solve?access_token=" access-token)
        json (generate-string {:secret secret})
        res (http/post url {:body json
                            :content-type :json})]
    (println "Result:"
             (:status @res)
             (:body @res))))

(defn handle-secret [m]
  (let [secret (subs m
                     (count "congratulations! the solution to this challenge is \"")
                     (- (count m) 1))]
    (post-solution secret)))

(defn handle-message [m]
  (println "<< " m)
  (cond
    (= m "ping!") (handle-ping)
    (str/starts-with? m "congratulations!") (handle-secret m)))

(defn connect [address]
  (ws/connect
    address
    :on-receive #'handle-message
    :on-error #(println "ERROR" %)
    :on-close #(println "Connection closed" %1 %2)))

(defn -main
  [& args]
  (println (grab-token))
  (swap! socket
         (fn [_]
           (connect (str ws-address @problem-token))))
  (checkpoint!))

```

Om du vil ha det litt gøy og samtidig trene på programmeirngsferdighetene dine så anbefaler jeg deg å teste ut en eller flere av disse ressursene.