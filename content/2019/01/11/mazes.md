---
title: "Generere labyrinter (i Go)"
layout: post
link: http://blog.kjempekjekt.com/2019/01/11/mazes/
date: 2019-01-11T09:28:27.581Z
tags:
  - Go
---

<p style="text-align:center">
![Sidewinder maze PNG](/uploads/2019/01/sidewinder.png)
</p>

Jeg har akkurat begynt å lese boken [_Mazes for Programmers_](https://pragprog.com/book/jbmaze/mazes-for-programmers) fra The Pragmatic Bookshelf, skrevet av Jamis Buck. Og dette er en skikkelig nerdebok, et dypdykk i algoritmer og teknikker for å generere labyrinter.

Eksemplene i boken bruker Ruby, men språket _jeg_ ønsker å bruke for tiden er Go. I kapittel 2 presenterer Jamis et rammeverk for å representere labyrinter, to enkle algoritmer for generering, samt kode for å skrive ut labyrinter i ASCII og for å tegne dem til PNG. Go-programmet jeg presenterer her inneholder en re-implementering av alt dette.

Merk at jeg ikke har mye erfaring med Go - jeg har bare lekt meg med det i et par måneder. Men det er et ganske enkelt språk å lære seg, så jeg er ganske komfortabel med at koden ikke er så helt ulik det en mer erfaren Go-utvikler kunne ha produsert.

Så la oss starte...

```
package main

import (
  "fmt"
  "image/color"
  "math/rand"
  "strings"
  "time"

  "github.com/fogleman/gg"
)
```

Jeg presenterer koden bit-for-bit fra start (pakkedeklarasjon) til slutt (main). Om du putter all koden i en .go-fil (f.eks. maze.go) så kan du kompilere og kjøre programmet med:

```
$ go get && go run maze.go
```

.. sålenge du har installert Go da. Det må du finne ut av selv.

Om du ønsker mer detaljert forklaring på hvorfor labyrint-ting er løst som de er så må du kjøpe boken :)

## En grid-representasjon

Den første biten av programmet er en generisk grid-representasjon av en labyrint. Den består av de to struktene `cell` og `grid` med tilhørende metoder.

Her er `cell`, den minste enheten i en labyrint:

```
type cell struct {
	row    int
	column int
	north  *cell
	south  *cell
	east   *cell
	west   *cell
	links  map[*cell]bool
}

func newCell(row, column int) *cell {
	return &cell{row: row, column: column, links: make(map[*cell]bool)}
}

func (c *cell) link(other *cell) {
	c.links[other] = true
	other.links[c] = true
}

func (c *cell) unlink(other *cell) {
	delete(c.links, other)
	delete(other.links, c)
}

func (c *cell) isLinked(other *cell) bool {
	_, ok := c.links[other]
	return ok
}

func (c *cell) linkedCells() (result []*cell) {
	result = make([]*cell, len(c.links))
	i := 0
	for k := range c.links {
		result[i] = k
		i++
	}
	return
}

func (c *cell) neighbors() (list []*cell) {
	list = make([]*cell, 0, 4)
	if c.east != nil {
		list = append(list, c.east)
	}
	if c.west != nil {
		list = append(list, c.west)
	}
	if c.north != nil {
		list = append(list, c.north)
	}
	if c.south != nil {
		list = append(list, c.south)
	}
	return
}
```

Og her er `grid`:

```
type grid struct {
	rows    int
	columns int
	grid    [][]*cell
}

func newGrid(rows, columns int) (g grid) {
	g = grid{rows: rows, columns: columns}
	g.grid = make([][]*cell, rows)
	for i := range g.grid {
		g.grid[i] = make([]*cell, columns)
		for j := 0; j < columns; j++ {
			g.grid[i][j] = newCell(i, j)
		}
	}
	g.eachCell(func(c *cell) {
		row := c.row
		col := c.column
		c.north = g.cellAt(row-1, col)
		c.south = g.cellAt(row+1, col)
		c.west = g.cellAt(row, col-1)
		c.east = g.cellAt(row, col+1)
	})
	return
}

func (g *grid) cellAt(row, column int) *cell {
	if row >= 0 && row < g.rows {
		if column >= 0 && column < len(g.grid[row]) {
			return g.grid[row][column]
		}
	}
	return nil
}

func (g *grid) randomCell() *cell {
	row := rand.Intn(g.rows)
	column := rand.Intn(len(g.grid[row]))
	return g.cellAt(row, column)
}

func (g grid) size() int {
	return g.rows * g.columns
}
```

Ruby-koden i boken inneholder også noen høyerenivå-funksjoner får å iterere rader og celler i griddet. Denne teknikken er nok mer ideomatisk i Ruby enn i Go, men jeg implementerte det så tett opp mot orginalen som jeg klarte. Så her er mine to iteratorer:

```
func (g *grid) eachRow(fn func([]*cell)) {
	for _, row := range g.grid {
		fn(row)
	}
}

func (g *grid) eachCell(fn func(*cell)) {
	g.eachRow(func(row []*cell) {
		for _, sell := range row {
			fn(sell)
		}
	})
}
```

## Labyrint som ASCII art

For å konvertere en `grid` strukt til en streng lager vi en `String() string`. Det er det samme som å implementere en `to_s` metode på et objekt i Ruby, eller som å implementere `override string ToString()` i C#.

Metoden er også det første eksempelet på hvordan jeg bruker iteratoren `eachRow` som vi nettopp lagde.

```
func (g grid) String() string {
	var sb strings.Builder
	sb.WriteString("+")
	for i := 0; i < g.columns; i++ {
		sb.WriteString("---+")
	}
	sb.WriteString("\n")

	g.eachRow(func(row []*cell) {
		top := "|"
		bottom := "+"

		for _, c := range row {
			if c == nil {
				c = newCell(-1, -1)
			}

			body := "   "
			eastBoundary := "|"
			if c.isLinked(c.east) {
				eastBoundary = " "
			}
			top += body + eastBoundary

			southBoundary := "---"
			if c.isLinked(c.south) {
				southBoundary = "   "
			}
			corder := "+"
			bottom += southBoundary + corder
		}
		sb.WriteString(top)
		sb.WriteString("\n")
		sb.WriteString(bottom)
		sb.WriteString("\n")
	})

	return sb.String()
}
```

Nå har vi kodet nok til at vi kan skrive en liten main-metode og printe et grid:

```
func main() {
	grid := newGrid(4, 4)
	fmt.Print(grid)
}
```

Om vi nå kjører programmet skal vi se dette:

```
+---+---+---+---+
|   |   |   |   |
+---+---+---+---+
|   |   |   |   |
+---+---+---+---+
|   |   |   |   |
+---+---+---+---+
|   |   |   |   |
+---+---+---+---+
```

## Algoritme: Binary Tree

Boken presenterer _Binary Tree_ som den absolutt enkleste algoritmen for å generere en labyrint. Nå når vi har gjort en grundig jobb med å representere og printe ut labyrinter så er selve genereringen ganske enkel. Her er min implementasjon av Binary Tree:

```
func (g *grid) binaryTreeMaze() {
	g.eachCell(func(c *cell) {
		neighbors := make([]*cell, 0, 2)
		if c.north != nil {
			neighbors = append(neighbors, c.north)
		}
		if c.east != nil {
			neighbors = append(neighbors, c.east)
		}
		if len(neighbors) > 0 {
			index := rand.Intn(len(neighbors))
			neighbor := neighbors[index]
			c.link(neighbor)
		}
	})
}
```

Om du nå endrer main til dette:

```
func main() {
	rand.Seed(time.Now().UnixNano())
	grid := newGrid(4, 4)
	grid.binaryTreeMaze()
	fmt.Print(grid)
}
```

.. så vil du få output som ligner på dette:

```
+---+---+---+---+
|               |
+---+---+   +   +
|           |   |
+---+   +   +   +
|       |   |   |
+---+---+   +   +
|           |   |
+---+---+---+---+
```

Labyrinter generert med Binary Tree har alltid lange korridorer langs den nordlige og østlige kanten. Den neste algoritmen er en forbedring...

## Algoritme: Sidewinder

La oss første lage et par hjelpefunksjoner for tilfeldighet. `sample()` gir deg et tilfeldig element fra et array / en slice, og `coinflip()` gir deg en tilfeldig boolean.

```
func sample(cells []*cell) *cell {
	return cells[rand.Intn(len(cells))]
}

func coinflip() bool {
	return rand.Intn(2) == 0
}
```

Og her er implementasjonen av _Sidewinder_-algoritmen:

```
func (g *grid) sidewinderMaze() {
	g.eachRow(func(row []*cell) {
		run := make([]*cell, 0, len(row))

		for _, c := range row {
			run = append(run, c)
			atEastBound := c.east == nil
			atNorthBound := c.north == nil
			shouldClose := atEastBound || (!atNorthBound && coinflip())

			if shouldClose {
				member := sample(run)
				if member.north != nil {
					member.link(member.north)
				}
				run = make([]*cell, 0, len(row))
			} else {
				c.link(c.east)
			}
		}
	})
}
```

La oss sammenligne output fra de to algoritmene ved å endre main til dette:

```
func main() {
	fmt.Println("\nBinary Tree Maze:")
	rand.Seed(420)
	grid := newGrid(7, 10)
	grid.binaryTreeMaze()
	fmt.Print(grid)

	fmt.Println("\nSidewinder Maze:")
	rand.Seed(420)
	grid = newGrid(7, 10)
	grid.sidewinderMaze()
	fmt.Print(grid)
}
```

Siden jeg nå har gitt random et konstant seed kan jeg med sikkerhet si at output blir dette:

```
Binary Tree Maze:
+---+---+---+---+---+---+---+---+---+---+
|                                       |
+   +---+---+---+   +   +   +   +---+   +
|   |               |   |   |   |       |
+---+   +   +---+---+   +---+---+   +   +
|       |   |           |           |   |
+   +   +---+---+   +   +---+---+   +   +
|   |   |           |   |           |   |
+---+---+   +---+---+---+---+---+---+   +
|           |                           |
+---+   +---+   +---+---+   +---+---+   +
|       |       |           |           |
+---+   +   +   +   +---+---+   +---+   +
|       |   |   |   |           |       |
+---+---+---+---+---+---+---+---+---+---+

Sidewinder Maze:
+---+---+---+---+---+---+---+---+---+---+
|                                       |
+   +   +   +   +   +   +---+---+   +   +
|   |   |   |   |   |           |   |   |
+   +   +---+   +---+   +---+   +---+   +
|   |   |           |       |   |       |
+   +---+---+   +---+   +---+   +---+---+
|   |           |           |           |
+   +---+---+   +   +---+   +---+---+   +
|           |   |   |       |           |
+   +   +   +---+---+   +---+   +   +   +
|   |   |           |   |       |   |   |
+   +   +---+---+---+---+   +---+---+---+
|   |   |                               |
+---+---+---+---+---+---+---+---+---+---+
```

Sidewinder gir fortsatt en lang korridor langs den nordlige kanten, men ikke langs øst.

## Tegne labyrinter til PNG

For å generere bilder gjorde jeg et raskt søk etter et enkelt tegnebiblotek i Go, og fant [fogleman/gg](https://github.com/fogleman/gg). Teknikken for å tegne labyrinten er nokså lik den som ble brukt for å generere ASCII-representasjonen.

Her er en funksjon som skriver ut en `grid` struct i svart og lysegrønn til en vilkårlig path:

```
func (g grid) Png(path string) error {
	cellSize := 10
	imgWidth := cellSize * g.columns
	imgHeight := cellSize * g.rows
	dc := gg.NewContext(imgWidth+4, imgHeight+4)

	dc.SetColor(color.Black)
	dc.DrawRectangle(0.0, 0.0, float64(imgWidth), float64(imgHeight))
	dc.Fill()

	dc.SetLineWidth(2.0)
	dc.SetRGB255(66, 244, 116)

	g.eachCell(func(c *cell) {
		x1 := float64(c.column*cellSize + 1)
		y1 := float64(c.row*cellSize + 1)
		x2 := float64((c.column+1)*cellSize + 1)
		y2 := float64((c.row+1)*cellSize + 1)

		if c.north == nil {
			dc.DrawLine(x1, y1, x2, y1)
			dc.Stroke()
		}
		if c.west == nil {
			dc.DrawLine(x1, y1, x1, y2)
			dc.Stroke()
		}
		if !c.isLinked(c.east) {
			dc.DrawLine(x2, y1, x2, y2)
			dc.Stroke()
		}
		if !c.isLinked(c.south) {
			dc.DrawLine(x1, y2, x2, y2)
			dc.Stroke()
		}
	})

	return dc.SavePNG(path)
}
```

Så kan vi bruke den i main:

```
func main() {
	rand.Seed(time.Now().UnixNano())
	path := "out.png"
	fmt.Println("Saving 15x60 Sidewinder maze to " + path)
	grid := newGrid(15, 60)
	grid.sidewinderMaze()
	if err := grid.Png(path); err != nil {
		panic(err)
	}
}
```

.. og få generert et bilde som dette:

<p style="text-align:center">
![Sidewinder maze PNG](/uploads/2019/01/sidewinder.png)
</p>

## Oppsummering

[_Mazes for Programmers_](https://pragprog.com/book/jbmaze/mazes-for-programmers) virker som en fasinerende og inspirerende bok med praktiske eksempler som gir meg lyst til å kode. Og i forhold til Go så må jeg innrømme at jeg begynner å bli glad i språket, på tross av alle reservasjoner jeg har hatt mot det tidligere. I likhet med labyrint-boken er programmeringsspråket pragmatisk, og jeg klarte enkelt å oversette denne koden fra Ruby _nesten_ helt uten å gjøre noen feil. 

Jeg gleder meg til både å fortsette å lese og lære om labyrinter og til å kode mer i Go!

PS: Koden fra denne blogposten er tilgjengelig [som en gist her](https://gist.github.com/tormaroe/78f7f784e0801ca0281c3335bb98936d).