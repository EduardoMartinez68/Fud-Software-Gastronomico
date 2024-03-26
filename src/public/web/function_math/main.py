import numpy as np
import matplotlib.pyplot as plt

def readDataX():
    return np.array([1920,1930,1940,1950,1960,1970,1980,1990])

def readDataY():
    return np.array([106.56,123.08,132.12,152.27,180,205,227.23,249.46])

def fx(x1,coef):
    fx=0
    n=len(coef)-1
    for p in coef:
        fx=fx+p*x1**n
        n=n-1
    return fx 

def draw_graph():
    x,y=readDataX(),readDataY()
    anno=2000
    degree=9
    coef=np.polyfit(x,y,degree)
    p=np.polyval(coef,anno) #prediction

    x1=np.linspace(1920,anno+1,1000)
    y1=fx(x1,coef)
    plt.figure(figsize=[20,10])
    plt.title("Cantidad de litros vs years usando la predicion de ")

    #character graphic 
    plt.scatter(x,y,s=120,c='blueviolet')
    plt.plot(x1,y1,"--",linewidth=3,color='orange')
    plt.scatter(anno,p,s=200,c='red')
    plt.yticks(range(100,320,20))
    plt.grid('on')

    plt.show()
draw_graph()

