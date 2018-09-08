class MySet{
    objects =[]
    add(obj){
        this.objects.push(obj)
    }
    has(obj){
       return this.objects.some((value)=>{return value == obj})
    }
}