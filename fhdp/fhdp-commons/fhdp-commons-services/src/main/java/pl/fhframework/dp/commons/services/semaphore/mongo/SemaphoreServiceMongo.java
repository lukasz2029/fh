package pl.fhframework.dp.commons.services.semaphore.mongo;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pl.fhframework.dp.commons.base.semafor.ISemaphoreService;
import pl.fhframework.dp.commons.base.semafor.SemaphoreStatusEnum;
import pl.fhframework.dp.commons.model.dao.SemaphoreDAO;

/**
 * @author <a href="mailto:jacek.borowiec@asseco.pl">Jacek Borowiec</a>
 * @version :  $, :  $
 * @created 28/08/2020
 */
@Slf4j
@Service
public class SemaphoreServiceMongo implements ISemaphoreService {

    @Autowired
    MongoTemplate mongoTemplate;


    /**
     * Semaphore set up for given time.
     * Subsequent lock for time > 0 extends semaphore validity. if seconds = 0, semaphore is unlocked immediately..
     * <p/>
     * Transaction = REQUIRES_NEW
     *
     * @param type   - semaphore type
     * @param key    - key, i.e. doc ID, process instance ID etc
     * @param value  - value (e.g. process instance guid)
     * @param seconds - how long semaphore is reserved
     * @return SemaforStatusEnum.InValid - if semaphore is already locked by another value.
     */
    @Override
    @Transactional
    public SemaphoreStatusEnum lockSemaphore(Enum type, String key, String value, int seconds) {
    	
        LocalDateTime currentDate = fetchCurrentDate();
        LocalDateTime validityDate = currentDate.plusSeconds(seconds); 
    	
    	String sType = type.name();
    	String id = sType + SemaphoreDto.SEPARATOR + key;
    	SemaphoreStatusEnum result = SemaphoreStatusEnum.Invalid;
    	
    	Criteria critID = Criteria.where("_id").is(id);
    	Criteria critValueNull = Criteria.where("value").exists(false);
    	Criteria critValue = Criteria.where("value").is(value);
    	Criteria critlockTime = Criteria.where("lockTime").lt(currentDate);
    	Criteria crit = new Criteria().andOperator(
    			critID,
    			new Criteria().orOperator(
    					critValueNull,
						critValue,
						critlockTime
    			)
    	);
        
    	Query query = new Query(crit);
        Update update = new Update().set("value", value).set("lockTime", validityDate);
        
    	SemaphoreDto semaphore = mongoTemplate.findById(id, SemaphoreDto.class);        
        if(semaphore == null) {
        	SemaphoreDto nSemaphore = new SemaphoreDto(type, key, value, validityDate);
        	//must be insert - should return error when other instance wrote it first 
            mongoTemplate.insert(nSemaphore);
            return SemaphoreStatusEnum.ValidNew;
        }
        
        if(semaphore!=null && semaphore.getValue()!=null && !semaphore.getValue().equals(value)) {
        	if(semaphore.getLockTime()!=null && semaphore.getLockTime().isAfter(currentDate)) {
        		return SemaphoreStatusEnum.Invalid;
        	}
        }

        SemaphoreDto newestValue = mongoTemplate.update(SemaphoreDto.class)
                .matching(query)
                .apply(update)
                .withOptions(FindAndModifyOptions.options().returnNew(true)) // Now return the newly updated document when updating
                .findAndModifyValue();        
        if(newestValue!=null) {
        	result = SemaphoreStatusEnum.ValidNew;
        	if(semaphore!=null && semaphore.getValue()!=null && semaphore.getValue().equals(value)) {
        		result = SemaphoreStatusEnum.ValidProlonged;
        	}
        }
    	
        return result;
    	
    }

    /**
     * Unlocking active semaphore.
     *
     * <p/>
     * Transaction = REQUIRED
     * <p/>
     * <b> Warning: when transaction is rolled back, semaphore remains locked!
     *     you can release it by locking with 0 seconds if you want.
     * </b>
     */
    @Override
    @Transactional
    public SemaphoreStatusEnum unlockSemaphore(Enum type, String key, String value) {
    	
        LocalDateTime currentDate = fetchCurrentDate();
    	
    	String sType = type.name();
    	String id = sType + SemaphoreDto.SEPARATOR + key;
    	SemaphoreStatusEnum result = SemaphoreStatusEnum.Invalid;
    	
    	Criteria critID = Criteria.where("_id").is(id);
    	Criteria critValueNull = Criteria.where("value").exists(false);
    	Criteria critValue = Criteria.where("value").is(value);
    	Criteria critlockTime = Criteria.where("lockTime").lt(currentDate);
    	Criteria crit = new Criteria().andOperator(
    			critID,
    			new Criteria().orOperator(
    					critValueNull,
						critValue,
						critlockTime
    			)
    	);
        
    	Query query = new Query(crit);
        Update update = new Update().set("value", value).set("lockTime", currentDate);
        
    	SemaphoreDto semaphore = mongoTemplate.findById(id, SemaphoreDto.class);        
        if(semaphore == null) {
        	SemaphoreDto nSemaphore = new SemaphoreDto(type, key, value, currentDate);
        	//must be insert - should return error when other instance wrote it first 
            mongoTemplate.insert(nSemaphore);
            return SemaphoreStatusEnum.ValidNew;
        }
        
        if(semaphore!=null && semaphore.getValue()!=null && !semaphore.getValue().equals(value)) {
        	if(semaphore.getLockTime()!=null && semaphore.getLockTime().isAfter(currentDate)) {
        		return SemaphoreStatusEnum.Invalid;
        	}
        }

        SemaphoreDto newestValue = mongoTemplate.update(SemaphoreDto.class)
                .matching(query)
                .apply(update)
                .withOptions(FindAndModifyOptions.options().returnNew(true)) // Now return the newly updated document when updating
                .findAndModifyValue();        
        if(newestValue!=null) {
        	result = SemaphoreStatusEnum.ValidNew;
        	if(semaphore!=null && semaphore.getValue()!=null && semaphore.getValue().equals(value)) {
        		result = SemaphoreStatusEnum.ValidProlonged;
        	}
        }
    	
        return result;
    	
    }
    
    public LocalDateTime fetchCurrentDate() {
        return LocalDateTime.now();
    }    
    
}
