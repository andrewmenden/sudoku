export const settings = {   
    appearance: {
        theme: "light",
        themes: {
            "light": {
                sudokuColors: {
                    defaultColor: "rgb(0,0,0)",
                    errorColor: "rgb(255,0,0)",
                    valueColor: "rgb(0,0,255)",
                    pencilColor1: "rgb(0,0,0)",
                    pencilColor2: "rgb(0,0,0)",

                    backgroundColor: "rgb(240,240,240)",
                    selectedBackgroundColor: "rgb(200,200,230)",
                    selectedBackgroundColor2: "rgb(230,230,240)",
                    selectedBackgroundColor3: "rgb(190,190,190)",
                    selectedBackgroundColor4: "rgb(220,220,220)",
                    errorBackgroundColor: "rgb(255,200,200)",
        
                    lineColor: "rgb(0,0,0)"
                }
            },
        },
        sudokuProperties: {
            minorLineWidth: 10,
            majorLineWidth: 20
        }
    },
    preferences: {
        //0: normal
        //1: highlight all numbers and what they hit
        //2: highlight all numbers
        //3: highlight all numbers excluding selected cell hits 
        highlightMode: 1
    }
}