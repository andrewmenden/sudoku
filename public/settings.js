export const settings = {
    appearance: {
        theme: "light",
        themes: {
            "dark": {
                sudokuColors: {
                    defaultColor: "rgb(255,255,255)",
                    errorColor: "rgb(255,0,0)",
                    valueColor: "rgb(0,0,255)",
                    
                    backgroundColor: "rgb(0,0,0)",
                    selectedBackgroundColor: "rgb(40,40,40)",
                    selectedBackgroundColor2: "rgb(20,20,20)",
                    errorBackgroundColor: "rgb(100,0,0)",

                    lineColor: "rgb(255,255,255)"
                }
            },
            "light": {
                sudokuColors: {
                    defaultColor: "rgb(0,0,0)",
                    errorColor: "rgb(255,0,0)",
                    valueColor: "rgb(0,0,255)",
                    
                    backgroundColor: "rgb(240,240,240)",
                    selectedBackgroundColor: "rgb(200,200,200)",
                    selectedBackgroundColor2: "rgb(220,220,220)",
                    errorBackgroundColor: "rgb(255,200,200)",
        
                    lineColor: "rgb(0,0,0)"
                }
            },
        },
        sudokuProperties: {
            minorLineWidth: 10,
            majorLineWidth: 20
        }
    }
}