export default class MyEmiter<Tcallback extends (...args:any[])=>any>{

    private events = new Map<string,Tcallback[]>();

    emit(eventName:string, ...data:Parameters<Tcallback>){
        const callbacks = this.events.get(eventName);

        if(!callbacks)return;

        callbacks.forEach(call=>{
            call(...data);
        })
    }

    sub(eventName:string,callback:Tcallback):()=>void{
        let callbacks = this.events.get(eventName);

        if(!callbacks){
            callbacks = [callback];
            this.events.set(eventName,callbacks);
        }else{
            callbacks.push(callback);
        }

        return ()=>{
            const innerCallbacks = this.events.get(eventName);
            if(!innerCallbacks){
                console.error("CustomEmiter error innerCallbacks is undefined.");
                return;
            }

            const newList = innerCallbacks.filter(_call=>_call !== callback);
            if(newList.length === 0){
                this.events.delete(eventName);
            }
            else{
                this.events.set(eventName,newList);
            }
        }
    }
}
